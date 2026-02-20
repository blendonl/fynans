from __future__ import annotations

from typing import Protocol

import numpy as np


class OCRResult:
    """Standardized OCR result from any engine."""

    __slots__ = ("rec_texts", "rec_scores", "rec_boxes")

    def __init__(
        self,
        rec_texts: list[str],
        rec_scores: list[float],
        rec_boxes: list[np.ndarray],
    ):
        self.rec_texts = rec_texts
        self.rec_scores = rec_scores
        self.rec_boxes = rec_boxes


class OCREngine(Protocol):
    """Protocol that all OCR engines must implement."""

    def predict(self, image: np.ndarray) -> OCRResult: ...

    def name(self) -> str: ...
