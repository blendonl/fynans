import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, Response
from paddleocr import PaddleOCR
import logging
import numpy as np

import config
from preprocessing import preprocess_for_ocr, preprocess_for_vlm

logging.basicConfig(level=getattr(logging, config.LOG_LEVEL, logging.INFO))
logger = logging.getLogger(__name__)

ocr = None


def get_ocr():
    global ocr
    if ocr is None:
        device = "gpu:0" if config.USE_GPU else "cpu"
        logger.info(
            f"Initializing PaddleOCR: det={config.TEXT_DETECTION_MODEL}, "
            f"rec={config.TEXT_RECOGNITION_MODEL}, device={device}"
        )
        ocr = PaddleOCR(
            text_detection_model_name=config.TEXT_DETECTION_MODEL,
            text_recognition_model_name=config.TEXT_RECOGNITION_MODEL,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            text_det_limit_side_len=config.DET_LIMIT_SIDE_LEN,
            text_det_limit_type="max",
            text_det_thresh=config.DET_THRESH,
            text_det_box_thresh=config.DET_BOX_THRESH,
            text_det_unclip_ratio=config.DET_UNCLIP_RATIO,
            text_recognition_batch_size=config.REC_BATCH_SIZE,
            text_rec_score_thresh=config.REC_SCORE_THRESH,
            device=device,
        )
    return ocr


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_ocr()
    logger.info("PaddleOCR service started successfully")
    yield


app = FastAPI(title="PaddleOCR Service", version="2.0.0", lifespan=lifespan)


@app.get("/health")
async def health_check():
    try:
        engine = get_ocr()
        if engine is None:
            raise RuntimeError("OCR engine not initialized")
        return {
            "status": "healthy",
            "service": "paddleocr",
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


def _group_into_lines(boxes_with_text: list, img_height: int) -> list[str]:
    """Group detected text boxes into lines based on vertical position."""
    if not boxes_with_text:
        return []

    boxes_with_text.sort(key=lambda b: (b["center_y"], b["left_x"]))

    line_height_threshold = max(15, int(img_height * 0.012))
    grouped_lines = []
    current_line = []

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


@app.post("/ocr/extract")
async def extract_text(file: UploadFile = File(...)):
    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file received")

    _validate_upload(file.content_type, len(image_bytes))
    logger.info(f"Processing image: {file.filename} ({len(image_bytes)} bytes)")

    timings = {}

    # Preprocessing
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

    # OCR inference
    try:
        t0 = time.monotonic()
        ocr_engine = get_ocr()
        result = await asyncio.to_thread(ocr_engine.predict, preprocessed_image)
        timings["ocr_ms"] = round((time.monotonic() - t0) * 1000, 1)
    except Exception as e:
        logger.error(f"OCR text extraction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="OCR text extraction failed")

    # Post-processing
    t0 = time.monotonic()

    if not result:
        logger.warning("No text detected in image")
        return JSONResponse(content={"text": "", "confidence": 0.0, "timings": timings})

    # PaddleOCR 3.x returns result objects — support both dict and attribute access
    first = result[0]
    res = first["res"] if isinstance(first, dict) else first.res
    if isinstance(res, dict):
        rec_texts = res.get("rec_texts", [])
        rec_scores = res.get("rec_scores", np.array([]))
        rec_boxes = res.get("rec_boxes", np.array([]))
    else:
        rec_texts = getattr(res, "rec_texts", [])
        rec_scores = getattr(res, "rec_scores", np.array([]))
        rec_boxes = getattr(res, "rec_boxes", np.array([]))

    logger.debug(f"OCR result: {len(rec_texts)} texts, boxes shape={getattr(rec_boxes, 'shape', 'N/A')}")

    if len(rec_texts) == 0:
        logger.warning("No text detected in image")
        return JSONResponse(content={"text": "", "confidence": 0.0, "timings": timings})

    boxes_with_text = []
    confidences = []

    for i, (text, score) in enumerate(zip(rec_texts, rec_scores)):
        conf = float(score)
        confidences.append(conf)

        if i < len(rec_boxes):
            box = rec_boxes[i]
            # Handle both axis-aligned [x_min, y_min, x_max, y_max]
            # and polygon [4, 2] formats
            box = np.asarray(box)
            if box.ndim == 2:
                # Polygon format [4, 2] — extract bounds
                left_x = float(box[:, 0].min())
                top_y = float(box[:, 1].min())
                bottom_y = float(box[:, 1].max())
            else:
                # Axis-aligned [x_min, y_min, x_max, y_max]
                left_x = float(box[0])
                top_y = float(box[1])
                bottom_y = float(box[3])
            center_y = (top_y + bottom_y) / 2
        else:
            left_x = 0
            center_y = i * 30  # fallback: stack vertically

        boxes_with_text.append({
            "text": text,
            "confidence": conf,
            "center_y": center_y,
            "left_x": left_x,
        })

    text_lines = _group_into_lines(boxes_with_text, img_height)
    full_text = "\n".join(text_lines)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

    timings["postprocess_ms"] = round((time.monotonic() - t0) * 1000, 1)
    timings["total_ms"] = round(
        timings.get("preprocess_ms", 0) + timings.get("ocr_ms", 0) + timings["postprocess_ms"], 1
    )

    logger.info(
        f"OCR completed. Text length: {len(full_text)}, Confidence: {avg_confidence:.2f}, "
        f"Timings: {timings}"
    )

    return JSONResponse(
        content={
            "text": full_text,
            "confidence": round(avg_confidence, 4),
            "timings": timings,
        }
    )


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
