# =============================================================================
# Queen Mama API - Optimized Multi-stage Dockerfile
# =============================================================================
# Build stages:
#   - base: Common dependencies and pnpm setup
#   - deps: Install node_modules with caching
#   - development: Dev server with hot-reload
#   - builder: Compile TypeScript for production
#   - production: Minimal runtime image
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Common dependencies and tools
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install system dependencies required for Prisma and native modules
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Setup pnpm via corepack (cleaner than npm install -g)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.12.0 --activate

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Dependencies - Install and cache node_modules
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy only package files first (better layer caching)
# Changes to source code won't invalidate this layer
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./

# Copy package.json files for each workspace package
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/api/package.json ./apps/api/

# Install dependencies with pnpm store cache mount
# This significantly speeds up subsequent builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 3: Development - Full source with hot-reload support
# -----------------------------------------------------------------------------
FROM deps AS development

# Copy full source code
COPY packages ./packages
COPY apps/api ./apps/api

# Generate Prisma client with all binary targets
RUN cd packages/database && pnpm run generate

# Environment
ENV NODE_ENV=development
ENV PORT=3003

# Create non-root user for security (even in development)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3003

# Start NestJS in watch mode
CMD ["pnpm", "run", "--filter=@queen-mama/api", "start:dev"]

# -----------------------------------------------------------------------------
# Stage 4: Builder - Compile TypeScript to JavaScript
# -----------------------------------------------------------------------------
FROM deps AS builder

# Copy source code
COPY packages ./packages
COPY apps/api ./apps/api

# Generate Prisma client BEFORE building
RUN cd packages/database && pnpm run generate

# Build the NestJS application
RUN pnpm run build --filter=@queen-mama/api

# Prune dev dependencies for smaller production image
RUN pnpm prune --prod

# -----------------------------------------------------------------------------
# Stage 5: Production - Minimal runtime image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install only runtime dependencies
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/database ./packages/database

# Environment
ENV NODE_ENV=production
ENV PORT=3003

# Switch to non-root user
USER nestjs

EXPOSE 3003

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

# Use dumb-init to handle signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
