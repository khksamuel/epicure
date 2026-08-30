FROM python:3.13-slim
RUN groupadd --system --gid 10001 epicure \
    && useradd --system --uid 10001 --gid epicure --create-home --home-dir /home/epicure epicure
WORKDIR /app
COPY pyproject.toml README.md requirements.runtime.lock ./
COPY src src
RUN pip install --no-cache-dir -r requirements.runtime.lock \
    && pip install --no-cache-dir --no-deps . \
    && chown -R 10001:10001 /app /home/epicure
ENV HF_HOME=/home/epicure/.cache/huggingface
USER 10001:10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)"]
CMD ["uvicorn", "epicure_backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
