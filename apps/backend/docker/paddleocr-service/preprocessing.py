import cv2
import numpy as np
import math


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Backward-compatible wrapper — uses OCR-optimized preprocessing."""
    return preprocess_for_ocr(image_bytes)


def preprocess_for_ocr(image_bytes: bytes) -> np.ndarray:
    """Aggressive preprocessing optimized for traditional OCR (PaddleOCR).

    Applies deskew, shadow removal, denoise, sharpen, and CLAHE.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image format")

    height, width = img.shape[:2]
    if width > 2000 or height > 2000:
        scale = min(2000 / width, 2000 / height)
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Deskew via Hough line detection
    img = _deskew(img)

    # Shadow removal via morphological background division
    img = _remove_shadows(img)

    # Denoise, sharpen, CLAHE on L channel
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    l_channel = cv2.fastNlMeansDenoising(l_channel, None, h=10, templateWindowSize=7, searchWindowSize=21)

    kernel = np.array([[ 0, -1,  0],
                       [-1,  5, -1],
                       [ 0, -1,  0]])
    l_channel = cv2.filter2D(l_channel, -1, kernel)

    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)

    enhanced_lab = cv2.merge([l_channel, a_channel, b_channel])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    return enhanced


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
    max_dim = 1536
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


def _deskew(img: np.ndarray) -> np.ndarray:
    """Correct skew using Hough line detection."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)

    if lines is None:
        return img

    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
        # Only consider near-horizontal lines (receipt text lines)
        if abs(angle) < 15:
            angles.append(angle)

    if not angles:
        return img

    median_angle = np.median(angles)
    if abs(median_angle) < 0.5:
        return img  # Already straight enough

    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, median_angle, 1.0)
    rotated = cv2.warpAffine(img, rotation_matrix, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return rotated


def _remove_shadows(img: np.ndarray) -> np.ndarray:
    """Remove uneven lighting/shadows via morphological background division."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Estimate background using large morphological closing
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
    background = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)

    # Divide to normalize lighting
    normalized = cv2.divide(gray, background, scale=255)

    # Convert back to BGR
    return cv2.cvtColor(normalized, cv2.COLOR_GRAY2BGR)
