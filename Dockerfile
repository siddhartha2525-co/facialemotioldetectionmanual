# Multi-stage build for production deployment
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
# Frontend is static, no build needed

FROM python:3.9-slim AS python-ai
WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*
COPY python-ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY python-ai/ .
EXPOSE 8000
CMD ["python", "api_server_hybrid.py"]

FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
EXPOSE 5001
CMD ["node", "server.js"]

FROM nginx:stable-alpine AS frontend
COPY --from=frontend-builder /app/frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

