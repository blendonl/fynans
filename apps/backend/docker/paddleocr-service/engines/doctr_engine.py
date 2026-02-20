from __future__ import annotations

import logging

import numpy as np

import config
from engines import OCRResult

logger = logging.getLogger(__name__)


class DocTREngine:
    def __init__(self):
        from doctr.models import ocr_predictor

        device = "cuda" if config.USE_GPU else "cpu"
        logger.info(f"Initializing docTR (fast_base + parseq) on {device}")

        self._predictor = ocr_predictor(
            det_arch="fast_base",
            reco_arch="parseq",
            pretrained=True,
        )
        if config.USE_GPU:
            self._predictor = self._predictor.cuda()

    def name(self) -> str:
        return "doctr"

    def predict(self, image: np.ndarray) -> OCRResult:
        from doctr.io import DocumentFile

        # docTR expects a list of numpy arrays
        doc = DocumentFile.from_images([image])
        result = self._predictor(doc)

        texts: list[str] = []
        scores: list[float] = []
        boxes: list[np.ndarray] = []

        img_h, img_w = image.shape[:2]

        for page in result.pages:
            for block in page.blocks:
                for line in block.lines:
                    for word in line.words:
                        texts.append(word.value)
                        scores.append(word.confidence)
                        # docTR returns normalized coords ((x_min, y_min), (x_max, y_max))
                        # Convert to absolute pixel coords in [x_min, y_min, x_max, y_max] format
                        (x_min, y_min), (x_max, y_max) = word.geometry
                        boxes.append(np.array([
                            x_min * img_w,
                            y_min * img_h,
                            x_max * img_w,
                            y_max * img_h,
                        ]))

        return OCRResult(texts, scores, boxes)
