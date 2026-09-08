# ==========================================
# STAGE 1: Dependency Builder Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ==========================================
# STAGE 2: Lightweight Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Run as non-root node user
USER node

# Copy dependencies and application source
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/

ENV NODE_ENV=production
EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5002/api/health || exit 1

CMD ["node", "src/index.js"]
