# ==========================================
# STAGE 1: React Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Accept VITE_API_GATEWAY_URL build argument
ARG VITE_API_GATEWAY_URL
ENV VITE_API_GATEWAY_URL=${VITE_API_GATEWAY_URL}

RUN npm run build

# ==========================================
# STAGE 2: Lightweight Nginx Web Server Stage
# ==========================================
FROM nginx:1.25-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
