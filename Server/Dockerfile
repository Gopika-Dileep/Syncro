# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package manifests and install all dependencies (including devDependencies for TS compilation)
COPY package*.json ./
RUN npm ci

# Copy TypeScript config and source files
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript project (transpile-only to avoid OOM on low-memory hosts)
# Type correctness is enforced via CI/local tsc --noEmit before push
RUN ./node_modules/.bin/tsc --noCheck --declaration false --declarationMap false --sourceMap false

# --- Production Runner Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create a logs directory and set ownership to the non-root node user
RUN mkdir -p logs && chown -R node:node logs

# Run as non-root user for security
USER node

# Expose server port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]
