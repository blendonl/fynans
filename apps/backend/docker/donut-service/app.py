from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import torch
from transformers import DonutProcessor, VisionEncoderDecoderModel
import re
import io
import logging

import config
from cord_mapper import map_cord_to_receipt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Donut CORD Service", version="1.0.0")

_model = None
_processor = None


def get_model():
    global _model, _processor
    if _model is None:
        logger.info(f"Loading model: {config.MODEL_NAME}")
        _processor = DonutProcessor.from_pretrained(config.MODEL_NAME)
        _model = VisionEncoderDecoderModel.from_pretrained(config.MODEL_NAME)
        _model.to("cuda")
        _model.eval()
        logger.info("Model loaded and moved to GPU")
    return _model, _processor


def resize_image(image: Image.Image, max_size: int) -> Image.Image:
    w, h = image.size
    if w <= max_size and h <= max_size:
        return image
    scale = min(max_size / w, max_size / h)
    new_w, new_h = int(w * scale), int(h * scale)
    return image.resize((new_w, new_h), Image.LANCZOS)


@app.on_event("startup")
async def startup_event():
    get_model()
    logger.info("Donut CORD service started successfully")


@app.get("/health")
async def health_check():
    try:
        model, _ = get_model()
        has_gpu = next(model.parameters()).is_cuda
        return {"status": "healthy", "service": "donut-cord", "gpu": has_gpu}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Model not ready")


@app.post("/parse")
async def parse_receipt(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file received")

        logger.info(f"Processing image: {file.filename} ({len(image_bytes)} bytes)")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = resize_image(image, config.MAX_IMAGE_SIZE)

        model, processor = get_model()

        # Prepare input with CORD v2 task prompt
        task_prompt = "<s_cord-v2>"
        decoder_input_ids = processor.tokenizer(
            task_prompt, add_special_tokens=False, return_tensors="pt"
        ).input_ids.to("cuda")

        pixel_values = processor(image, return_tensors="pt").pixel_values.to("cuda")

        with torch.no_grad():
            outputs = model.generate(
                pixel_values,
                decoder_input_ids=decoder_input_ids,
                max_length=model.decoder.config.max_position_embeddings,
                pad_token_id=processor.tokenizer.pad_token_id,
                eos_token_id=processor.tokenizer.eos_token_id,
                use_cache=True,
                num_beams=1,
            )

        # Decode and parse the token sequence
        decoded = processor.batch_decode(outputs)[0]
        decoded = decoded.replace(processor.tokenizer.eos_token, "").replace(
            processor.tokenizer.pad_token, ""
        )
        decoded = re.sub(r"<.*?>", "", decoded, count=1)  # remove task prompt token
        cord_output = processor.token2json(decoded)

        logger.info(f"CORD raw output: {cord_output}")

        result = map_cord_to_receipt(cord_output if isinstance(cord_output, dict) else {})

        logger.info(f"Parsed {len(result['items'])} items, total: {result.get('totalAmount')}")

        return JSONResponse(content=result, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Receipt parsing failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to parse receipt image")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=config.PORT)
