import os

# Note: PaddleOCR doesn't support Albanian (sq). We use "en" for Latin script recognition.
# This config is kept for documentation; the actual lang used is "en" in app.py.
LANGUAGES = os.getenv("LANGUAGES", "sq,en").split(",")
USE_GPU = os.getenv("USE_GPU", "false").lower() == "true"
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
USE_ANGLE_CLS = os.getenv("USE_ANGLE_CLS", "true").lower() == "true"
PORT = int(os.getenv("PORT", "8000"))
