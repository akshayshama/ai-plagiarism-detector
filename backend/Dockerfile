FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HUB_DISABLE_TELEMETRY=1 \
    HF_HOME=/root/.cache/huggingface \
    TRANSFORMERS_CACHE=/root/.cache/huggingface

COPY requirements.txt .
# CPU-only torch from the PyTorch CPU wheelhouse, then the rest from PyPI
# (torch is already satisfied, so the second install skips it).
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 && \
    pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Bake the ML models into the image so Cloud Run cold starts are fast
# instead of re-downloading ~600 MB on every cold start.
RUN huggingface-cli download Hello-SimpleAI/chatgpt-detector-roberta && \
    huggingface-cli download sentence-transformers/all-MiniLM-L6-v2

# Cloud Run / Render / Railway inject PORT (defaults to 8000 locally).
EXPOSE ${PORT:-8000}
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
