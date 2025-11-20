# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with adapter-node
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if(r.statusCode===200){process.exit(0)}else{process.exit(1)}})"

# Start the application
CMD ["node", "build"]
