import cv2
import numpy as np

import config


def preprocess_for_ocr(image_bytes: bytes) -> np.ndarray:
    """Preprocessing optimized for PaddleOCR PP-OCRv5 with GPU.

    Pipeline: Decode -> Resize -> Shadow removal (adaptive) ->
              Bilateral filter -> CLAHE

    Note: Binarization and unsharp mask were removed — PP-OCRv5's deep learning
    models perform better on natural/grayscale images. Binarization destroys
    subtle edge info and causes faint thermal receipt text to vanish.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image format")

    height, width = img.shape[:2]

    # Reject absurdly large images early
    if height * width > config.MAX_IMAGE_PIXELS:
        raise ValueError(f"Image too large: {width}x{height} ({height * width} pixels, max {config.MAX_IMAGE_PIXELS})")

    # Resize to match det_limit_side_len
    max_dim = config.MAX_IMAGE_DIM
    if width > max_dim or height > max_dim:
        scale = min(max_dim / width, max_dim / height)
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Adaptive shadow removal (single grayscale-based estimation)
    img = _remove_shadows(img)

    # Bilateral filter: smooths noise while preserving text edges
    img = cv2.bilateralFilter(img, d=7, sigmaColor=50, sigmaSpace=50)

    # CLAHE on L channel for contrast normalization
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)

    enhanced_lab = cv2.merge([l_channel, a_channel, b_channel])
    img = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    return img


def preprocess_for_vlm(image_bytes: bytes) -> bytes:
    """Light preprocessing optimized for Vision LLMs (Qwen2.5-VL).

    VLMs work best with minimal processing — just resize and mild CLAHE.
    Returns JPEG bytes.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image format")

    height, width = img.shape[:2]

    if height * width > config.MAX_IMAGE_PIXELS:
        raise ValueError(f"Image too large: {width}x{height} ({height * width} pixels, max {config.MAX_IMAGE_PIXELS})")

    max_dim = 1536  # VLM-specific: common optimal resolution for vision models
    if width > max_dim or height > max_dim:
        scale = min(max_dim / width, max_dim / height)
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Mild CLAHE only — no denoise or sharpen
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)

    enhanced_lab = cv2.merge([l_channel, a_channel, b_channel])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    _, jpeg_bytes = cv2.imencode('.jpg', enhanced, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return jpeg_bytes.tobytes()


def _remove_shadows(img: np.ndarray) -> np.ndarray:
    """Remove uneven lighting/shadows via grayscale-based morphological estimation.

    Uses a single grayscale morphology pass to estimate the background, then
    applies the correction to all BGR channels. Faster than per-channel and
    adaptive to image size.
    """
    # Adaptive kernel: ~3% of the smallest dimension, clamped to odd and >= 15
    min_dim = min(img.shape[0], img.shape[1])
    ksize = max(15, int(min_dim * 0.03) | 1)  # bitwise OR 1 ensures odd
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))

    # Estimate background from grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    background = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)

    # Apply correction to each channel using the grayscale background
    channels = cv2.split(img)
    normalized_channels = []
    for ch in channels:
        normalized = cv2.divide(ch, background, scale=255)
        normalized_channels.append(normalized)

    return cv2.merge(normalized_channels)
