FROM nvidia/cuda:12.6.3-cudnn-runtime-ubuntu22.04

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    # docTR needs these for Pillow/image handling
    libjpeg-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install requirements first (pulls torch + NVIDIA CUDA 12.8 libs)
RUN pip3 install --no-cache-dir -r requirements.txt

# Install paddlepaddle-gpu LAST so its pinned CUDA 12.6 NVIDIA libs overwrite torch's 12.8 versions.
# PyTorch is compatible with the slightly older CUDA 12.6 libs from the base image.
RUN curl -L --retry 5 --retry-delay 10 --connect-timeout 60 -o /tmp/paddlepaddle_gpu-3.0.0-cp310-cp310-manylinux1_x86_64.whl \
    "https://paddle-whl.bj.bcebos.com/stable/cu126/paddlepaddle-gpu/paddlepaddle_gpu-3.0.0-cp310-cp310-manylinux1_x86_64.whl" && \
    pip3 install --no-cache-dir --force-reinstall /tmp/paddlepaddle_gpu-3.0.0-cp310-cp310-manylinux1_x86_64.whl && \
    rm /tmp/paddlepaddle_gpu-3.0.0-cp310-cp310-manylinux1_x86_64.whl

COPY . .

EXPOSE 8000

CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
