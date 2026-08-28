FROM python:3.13-slim
WORKDIR /app
COPY pyproject.toml README.md requirements.runtime.lock ./
COPY src src
RUN pip install --no-cache-dir -r requirements.runtime.lock \
    && pip install --no-cache-dir --no-deps .
EXPOSE 8000
CMD ["uvicorn", "epicure_backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
