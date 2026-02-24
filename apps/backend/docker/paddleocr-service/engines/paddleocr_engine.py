from __future__ import annotations

import logging

import numpy as np
from paddleocr import PaddleOCR

import config
from engines import OCRResult

logger = logging.getLogger(__name__)


class PaddleOCREngine:
    def __init__(self):
        device = "gpu:0" if config.USE_GPU else "cpu"
        logger.info(
            f"Initializing PaddleOCR: det={config.TEXT_DETECTION_MODEL}, "
            f"rec={config.TEXT_RECOGNITION_MODEL}, device={device}"
        )
        ocr_kwargs = dict(
            text_detection_model_name=config.TEXT_DETECTION_MODEL,
            text_recognition_model_name=config.TEXT_RECOGNITION_MODEL,
            use_doc_orientation_classify=config.USE_DOC_ORIENTATION,
            use_doc_unwarping=config.USE_DOC_UNWARPING,
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

        # Disable oneDNN on CPU to avoid PaddlePaddle >=3.3.0 PIR regression
        # https://github.com/PaddlePaddle/Paddle/issues/77340
        if not config.USE_GPU:
            ocr_kwargs["enable_mkldnn"] = False

        self._ocr = PaddleOCR(**ocr_kwargs)

    def name(self) -> str:
        return "paddleocr"

    def predict(self, image: np.ndarray) -> OCRResult:
        result = self._ocr.predict(image)

        if not result:
            return OCRResult([], [], [])

        first = result[0]

        # Extract the result object — try 'res' key, then 'result', then use first directly
        if isinstance(first, dict):
            res = first.get("res") or first.get("result") or first
        else:
            res = getattr(first, "res", None) or getattr(first, "result", None) or first

        if isinstance(res, dict):
            rec_texts = res.get("rec_texts", [])
            rec_scores = res.get("rec_scores", np.array([]))
            rec_boxes = res.get("rec_boxes", np.array([]))
        else:
            rec_texts = getattr(res, "rec_texts", [])
            rec_scores = getattr(res, "rec_scores", np.array([]))
            rec_boxes = getattr(res, "rec_boxes", np.array([]))

        scores = [float(s) for s in rec_scores]
        boxes = []
        for i in range(len(rec_texts)):
            if i < len(rec_boxes):
                boxes.append(np.asarray(rec_boxes[i]))
            else:
                boxes.append(np.array([]))

        return OCRResult(list(rec_texts), scores, boxes)
