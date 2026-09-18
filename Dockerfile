FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 3001
CMD ["node", "server.js"]
