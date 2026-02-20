import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, Response
import logging
import numpy as np

import config
from engines import OCREngine, OCRResult
from preprocessing import preprocess_for_ocr, preprocess_for_vlm

logging.basicConfig(level=getattr(logging, config.LOG_LEVEL, logging.INFO))
logger = logging.getLogger(__name__)

_engines: dict[str, OCREngine] = {}


def _create_engine(name: str) -> OCREngine:
    if name == "paddleocr":
        from engines.paddleocr_engine import PaddleOCREngine
        return PaddleOCREngine()
    elif name == "doctr":
        from engines.doctr_engine import DocTREngine
        return DocTREngine()
    else:
        raise ValueError(f"Unknown OCR engine: {name}")


def get_engine(name: str | None = None) -> OCREngine:
    engine_name = name or config.OCR_ENGINE
    if engine_name not in _engines:
        _engines[engine_name] = _create_engine(engine_name)
    return _engines[engine_name]


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_engine()
    logger.info(f"OCR service started (engine={config.OCR_ENGINE})")
    yield


app = FastAPI(title="PaddleOCR Service", version="3.0.0", lifespan=lifespan)


@app.get("/health")
async def health_check():
    try:
        engine = get_engine()
        return {
            "status": "healthy",
            "service": "paddleocr",
            "engine": engine.name(),
            "det_model": config.TEXT_DETECTION_MODEL,
            "rec_model": config.TEXT_RECOGNITION_MODEL,
            "device": "gpu:0" if config.USE_GPU else "cpu",
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            content={"status": "unhealthy", "error": str(e)},
            status_code=503,
        )


def _validate_upload(content_type: str | None, size: int):
    if content_type and not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"Invalid content type: {content_type}. Expected image/*")
    max_bytes = config.MAX_FILE_SIZE_MB * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(status_code=400, detail=f"File too large: {size} bytes (max {config.MAX_FILE_SIZE_MB}MB)")


def _extract_boxes(ocr_result: OCRResult, img_height: int) -> list[dict]:
    """Convert OCRResult into annotated box dicts for line grouping."""
    boxes_with_text = []

    for i, (text, score) in enumerate(zip(ocr_result.rec_texts, ocr_result.rec_scores)):
        conf = float(score)

        if i < len(ocr_result.rec_boxes):
            box = ocr_result.rec_boxes[i]
            box = np.asarray(box)
            if box.ndim == 2:
                # Polygon format [4, 2]
                left_x = float(box[:, 0].min())
                top_y = float(box[:, 1].min())
                bottom_y = float(box[:, 1].max())
            elif box.size >= 4:
                # Axis-aligned [x_min, y_min, x_max, y_max]
                left_x = float(box[0])
                top_y = float(box[1])
                bottom_y = float(box[3])
            else:
                left_x = 0
                top_y = i * 30
                bottom_y = top_y + 20
            center_y = (top_y + bottom_y) / 2
            box_height = bottom_y - top_y
        else:
            left_x = 0
            center_y = i * 30
            box_height = 20

        boxes_with_text.append({
            "text": text,
            "confidence": conf,
            "center_y": center_y,
            "left_x": left_x,
            "box_height": box_height,
        })

    return boxes_with_text


def _group_into_lines(boxes_with_text: list[dict], img_height: int) -> list[str]:
    """Group detected text boxes into lines based on vertical position.

    Uses median box height for adaptive thresholding instead of a fixed
    image-height ratio, which handles variable font sizes better.
    """
    if not boxes_with_text:
        return []

    boxes_with_text.sort(key=lambda b: (b["center_y"], b["left_x"]))

    # Compute threshold from median box height
    box_heights = [b["box_height"] for b in boxes_with_text if b["box_height"] > 0]
    if box_heights:
        median_height = sorted(box_heights)[len(box_heights) // 2]
        line_height_threshold = max(10, int(median_height * 0.6))
    else:
        line_height_threshold = max(15, int(img_height * 0.012))

    grouped_lines: list[list[dict]] = []
    current_line: list[dict] = []

    for box in boxes_with_text:
        if not current_line:
            current_line.append(box)
        else:
            avg_y = sum(b["center_y"] for b in current_line) / len(current_line)
            if abs(box["center_y"] - avg_y) <= line_height_threshold:
                current_line.append(box)
            else:
                current_line.sort(key=lambda b: b["left_x"])
                grouped_lines.append(current_line)
                current_line = [box]

    if current_line:
        current_line.sort(key=lambda b: b["left_x"])
        grouped_lines.append(current_line)

    return [" ".join(box["text"] for box in line_boxes) for line_boxes in grouped_lines]


def _mark_low_confidence(boxes_with_text: list[dict]) -> None:
    """Add [?]...[/?] markers around text with confidence below threshold."""
    threshold = config.LOW_CONF_MARKER
    for box in boxes_with_text:
        if box["confidence"] < threshold:
            box["text"] = f'[?]{box["text"]}[/?]'


def _weighted_confidence(boxes_with_text: list[dict]) -> float:
    """Compute text-length-weighted average confidence."""
    total_weight = sum(len(b["text"]) for b in boxes_with_text)
    if total_weight == 0:
        return 0.0
    return sum(b["confidence"] * len(b["text"]) for b in boxes_with_text) / total_weight


def _run_ocr_pipeline(
    engine: OCREngine,
    preprocessed_image: np.ndarray,
    img_height: int,
) -> dict:
    """Run OCR and post-processing, returning the response payload."""
    timings: dict[str, float] = {}

    t0 = time.monotonic()
    ocr_result = engine.predict(preprocessed_image)
    timings["ocr_ms"] = round((time.monotonic() - t0) * 1000, 1)

    t0 = time.monotonic()

    if not ocr_result.rec_texts:
        timings["postprocess_ms"] = 0.0
        return {"text": "", "confidence": 0.0, "timings": timings}

    boxes_with_text = _extract_boxes(ocr_result, img_height)

    if logger.isEnabledFor(logging.DEBUG):
        for box in boxes_with_text:
            logger.debug(f"  box: conf={box['confidence']:.3f} text=\"{box['text']}\"")

    avg_confidence = _weighted_confidence(boxes_with_text)
    _mark_low_confidence(boxes_with_text)

    text_lines = _group_into_lines(boxes_with_text, img_height)
    full_text = "\n".join(text_lines)

    timings["postprocess_ms"] = round((time.monotonic() - t0) * 1000, 1)

    return {
        "text": full_text,
        "confidence": round(avg_confidence, 4),
        "timings": timings,
    }


async def _preprocess_upload(file: UploadFile) -> tuple[np.ndarray, int, dict]:
    """Read, validate, and preprocess an uploaded image.

    Returns (preprocessed_image, img_height, timings_dict).
    """
    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file received")

    _validate_upload(file.content_type, len(image_bytes))
    logger.info(f"Processing image: {file.filename} ({len(image_bytes)} bytes)")

    timings: dict[str, float] = {}

    try:
        t0 = time.monotonic()
        preprocessed_image = preprocess_for_ocr(image_bytes)
        img_height = preprocessed_image.shape[0]
        timings["preprocess_ms"] = round((time.monotonic() - t0) * 1000, 1)
    except ValueError as e:
        logger.error(f"Invalid image: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Image preprocessing failed")

    return preprocessed_image, img_height, timings


@app.post("/ocr/extract")
async def extract_text(file: UploadFile = File(...)):
    preprocessed_image, img_height, timings = await _preprocess_upload(file)

    try:
        engine = get_engine()
        result = await asyncio.to_thread(
            _run_ocr_pipeline, engine, preprocessed_image, img_height
        )
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="OCR text extraction failed")

    # Merge preprocessing timings into result timings
    result["timings"] = {**timings, **result["timings"]}
    result["timings"]["total_ms"] = round(
        timings.get("preprocess_ms", 0)
        + result["timings"].get("ocr_ms", 0)
        + result["timings"].get("postprocess_ms", 0),
        1,
    )
    result["engine"] = engine.name()

    logger.info(
        f"OCR completed. Text length: {len(result['text'])}, "
        f"Confidence: {result['confidence']:.2f}, Timings: {result['timings']}"
    )

    return JSONResponse(content=result)


@app.post("/ocr/compare")
async def compare_engines(file: UploadFile = File(...)):
    """Run both PaddleOCR and docTR on the same image for A/B comparison."""
    preprocessed_image, img_height, preprocess_timings = await _preprocess_upload(file)

    results = {}
    for engine_name in ("paddleocr", "doctr"):
        try:
            engine = get_engine(engine_name)
            result = await asyncio.to_thread(
                _run_ocr_pipeline, engine, preprocessed_image, img_height
            )
            result["timings"] = {**preprocess_timings, **result["timings"]}
            result["engine"] = engine_name
            results[engine_name] = result
        except Exception as e:
            logger.error(f"Compare: {engine_name} failed: {e}", exc_info=True)
            results[engine_name] = {"error": str(e), "engine": engine_name}

    return JSONResponse(content=results)


@app.post("/preprocess/vlm")
async def preprocess_vlm(file: UploadFile = File(...)):
    """Return a lightly preprocessed JPEG for vision LLM consumption."""
    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file received")

    _validate_upload(file.content_type, len(image_bytes))
    logger.info(f"VLM preprocessing image: {file.filename} ({len(image_bytes)} bytes)")

    try:
        jpeg_bytes = preprocess_for_vlm(image_bytes)
        return Response(content=jpeg_bytes, media_type="image/jpeg")
    except ValueError as e:
        logger.error(f"Invalid image: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"VLM preprocessing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to preprocess image")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=config.PORT)
