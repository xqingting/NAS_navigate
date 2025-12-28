# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Fix permissions for node_modules/.bin
# 显式给予执行权限，防止 "Permission denied"
RUN chmod +x node_modules/.bin/vite && chmod +x node_modules/.bin/tsc

# Build frontend and backend
# 这里也可以改成 npx vite build && npx tsc ... 以防万一
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
# Copy config file (default one, will be overwritten by volume if mounted)
COPY --from=builder /app/config ./config

# Expose port
EXPOSE 3000

# Environment variables default values
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Start command
CMD ["node", "dist/server/index.js"]