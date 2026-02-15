from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR
import logging
import config
from preprocessing import preprocess_image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PaddleOCR Service", version="1.0.0")

ocr = None


def get_ocr():
    global ocr
    if ocr is None:
        logger.info(f"Initializing PaddleOCR with languages: {config.LANGUAGES}")
        ocr = PaddleOCR(
            lang=config.LANGUAGES[0] if config.LANGUAGES else "en",
            use_angle_cls=True,
            use_gpu=config.USE_GPU,
            det_limit_side_len=1280,
            det_db_thresh=0.3,
            det_db_box_thresh=0.5,
            det_db_unclip_ratio=1.6,
            rec_batch_num=6,
            drop_score=0.3,
        )
    return ocr


@app.on_event("startup")
async def startup_event():
    get_ocr()
    logger.info("PaddleOCR service started successfully")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "paddleocr"}


@app.post("/ocr/extract")
async def extract_text(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file received")

        logger.info(f"Processing image: {file.filename} ({len(image_bytes)} bytes)")

        preprocessed_image = preprocess_image(image_bytes)

        ocr_engine = get_ocr()
        result = ocr_engine.ocr(preprocessed_image, cls=True)

        if not result or not result[0]:
            logger.warning("No text detected in image")
            return JSONResponse(
                content={"text": "", "confidence": 0.0},
                status_code=200
            )

        boxes_with_text = []
        confidences = []

        for line in result[0]:
            if line and len(line) >= 2:
                box = line[0]
                text = line[1][0]
                confidence = line[1][1]

                if confidence < config.CONFIDENCE_THRESHOLD:
                    logger.debug(f"Skipping low-confidence detection: '{text}' ({confidence:.2f})")
                    continue

                top_y = min(point[1] for point in box)
                left_x = min(point[0] for point in box)

                boxes_with_text.append({
                    'text': text,
                    'confidence': confidence,
                    'top_y': top_y,
                    'left_x': left_x
                })
                confidences.append(confidence)

        boxes_with_text.sort(key=lambda b: (b['top_y'], b['left_x']))

        line_height_threshold = 20
        grouped_lines = []
        current_line = []

        for box in boxes_with_text:
            if not current_line:
                current_line.append(box)
            else:
                avg_y = sum(b['top_y'] for b in current_line) / len(current_line)
                if abs(box['top_y'] - avg_y) <= line_height_threshold:
                    current_line.append(box)
                else:
                    current_line.sort(key=lambda b: b['left_x'])
                    grouped_lines.append(current_line)
                    current_line = [box]

        if current_line:
            current_line.sort(key=lambda b: b['left_x'])
            grouped_lines.append(current_line)

        text_lines = []
        for line_boxes in grouped_lines:
            line_text = ' '.join(box['text'] for box in line_boxes)
            text_lines.append(line_text)

        full_text = "\n".join(text_lines)
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        logger.info(f"OCR completed. Text length: {len(full_text)}, Confidence: {avg_confidence:.2f}")
        logger.debug(f"Extracted text:\n{full_text}")

        return JSONResponse(
            content={
                "text": full_text,
                "confidence": round(avg_confidence, 4)
            },
            status_code=200
        )

    except ValueError as e:
        logger.error(f"Invalid image: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"OCR extraction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to extract text from image")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=config.PORT)
