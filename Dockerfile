# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the server
RUN npm run server:build

# Build the web app (set the production API domain)
ARG EXPO_PUBLIC_DOMAIN
ENV EXPO_PUBLIC_DOMAIN=${EXPO_PUBLIC_DOMAIN}
RUN npx expo export --platform web

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built server
COPY --from=builder /app/server_dist ./server_dist

# Copy shared schema (needed at runtime)
COPY --from=builder /app/shared ./shared

# Copy server templates (needed for landing page)
COPY --from=builder /app/server/templates ./server/templates

# Copy the built web app
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server_dist/index.js"]
