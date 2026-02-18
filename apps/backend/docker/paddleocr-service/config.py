import os

# Server
PORT = int(os.getenv("PORT", "8000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# Device
USE_GPU = os.getenv("USE_GPU", "true").lower() == "true"

# OCR model selection
TEXT_DETECTION_MODEL = os.getenv("TEXT_DETECTION_MODEL", "PP-OCRv5_server_det")
TEXT_RECOGNITION_MODEL = os.getenv("TEXT_RECOGNITION_MODEL", "PP-OCRv5_server_rec")

# Text detection parameters
DET_LIMIT_SIDE_LEN = int(os.getenv("DET_LIMIT_SIDE_LEN", "1920"))
DET_THRESH = float(os.getenv("DET_THRESH", "0.3"))
DET_BOX_THRESH = float(os.getenv("DET_BOX_THRESH", "0.5"))
DET_UNCLIP_RATIO = float(os.getenv("DET_UNCLIP_RATIO", "1.8"))

# Text recognition parameters
REC_BATCH_SIZE = int(os.getenv("REC_BATCH_SIZE", "16"))
REC_SCORE_THRESH = float(os.getenv("REC_SCORE_THRESH", "0.5"))

# Preprocessing
MAX_IMAGE_DIM = int(os.getenv("MAX_IMAGE_DIM", "1920"))

# Input validation
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "20"))
MAX_IMAGE_PIXELS = int(os.getenv("MAX_IMAGE_PIXELS", "64000000"))  # 8000x8000
