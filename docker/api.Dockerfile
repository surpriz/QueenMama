FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json ./

# Copy all packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN cd packages/database && pnpm run generate

# Development
FROM base AS development
WORKDIR /app/apps/api
CMD ["pnpm", "run", "start:dev"]

# Production build
FROM base AS builder
WORKDIR /app
RUN pnpm run build --filter=api

# Production
FROM node:20-alpine AS production
RUN npm install -g pnpm
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 3001
CMD ["node", "dist/main.js"]
