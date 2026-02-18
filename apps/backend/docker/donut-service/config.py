import os

MODEL_NAME = os.getenv("MODEL_NAME", "naver-clova-ix/donut-base-finetuned-cord-v2")
PORT = int(os.getenv("PORT", "8001"))
TIMEOUT = int(os.getenv("TIMEOUT", "120"))
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", "1280"))
