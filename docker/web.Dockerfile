# =============================================================================
# Queen Mama Web - Optimized Multi-stage Dockerfile
# =============================================================================
# Build stages:
#   - base: Common dependencies and pnpm setup
#   - deps: Install node_modules with caching
#   - development: Dev server with hot-reload
#   - builder: Build Next.js for production
#   - production: Minimal runtime with standalone output
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Common dependencies and tools
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Setup pnpm via corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.12.0 --activate

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Dependencies - Install and cache node_modules
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy only package files first (better layer caching)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./

# Copy package.json files for each workspace package
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/web/package.json ./apps/web/

# Install dependencies with cache mount
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 3: Development - Dev server with hot-reload
# -----------------------------------------------------------------------------
FROM deps AS development

# Copy full source code
COPY packages ./packages
COPY apps/web ./apps/web

# Environment
ENV NODE_ENV=development
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
# Enable polling for file watching in Docker
ENV WATCHPACK_POLLING=true

# Note: Running as root in development for Docker volume compatibility
# Production stage uses non-root user for security

EXPOSE 3000

# Start Next.js dev server with Turbopack
CMD ["pnpm", "run", "--filter=@queen-mama/web", "dev"]

# -----------------------------------------------------------------------------
# Stage 4: Builder - Build for production
# -----------------------------------------------------------------------------
FROM deps AS builder

# Copy source
COPY packages ./packages
COPY apps/web ./apps/web

# Build arguments for public environment variables
# These are baked into the build at compile time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN pnpm run build --filter=@queen-mama/web

# -----------------------------------------------------------------------------
# Stage 5: Production - Minimal runtime image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install minimal runtime dependencies
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy standalone build output
# Next.js standalone output includes only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/web/server.js"]
