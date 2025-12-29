# Queen Mama - Lead Generation Platform

> B2B lead generation SaaS platform with pay-per-lead model

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Start infrastructure (recommended for local dev)
make dev

# 4. Generate Prisma client & run migrations
pnpm run db:generate
pnpm run db:migrate

# 5. Start development servers locally
# Terminal 1:
pnpm run dev --filter=@queen-mama/api

# Terminal 2:
pnpm run dev --filter=@queen-mama/web
```

### Alternative: Run Everything in Docker

```bash
# Start all services in Docker
make dev-full

# Run migrations inside container
docker compose exec api npx prisma migrate deploy
```

### Access Points (Local Dev)
- **Frontend**: http://localhost:3002
- **API**: http://localhost:3003
- **API Health**: http://localhost:3003/health
- **API Docs**: http://localhost:3003/api-docs
- **Prisma Studio**: `pnpm run db:studio`
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6380
- **MinIO API**: http://localhost:9000
- **MinIO Console**: http://localhost:9001

**Note**: Ports are configurable via environment variables. See [Port Configuration](#-port-configuration).

## 📁 Project Structure

```
queen-mama/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── database/     # Prisma schema
│   ├── typescript-config/
│   └── eslint-config/
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
└── docker-compose.yml
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: NestJS, Prisma, PostgreSQL, Redis, BullMQ
- **Auth**: Clerk
- **Payments**: Stripe
- **Email**: Resend
- **DevOps**: Docker, GitHub Actions

## 🐳 Docker Commands

The project includes a Makefile with useful Docker commands:

```bash
# Development
make dev              # Start infrastructure only (DB, Redis, MinIO)
make dev-full         # Start all services in Docker (API + Web + infra)
make stop             # Stop all containers

# Maintenance
make rebuild          # Clean volumes + rebuild (fixes Prisma issues)
make clean-volumes    # Remove node_modules volumes only
make clean            # Remove all containers and volumes (⚠️ includes data!)

# Logs & Status
make logs             # Follow logs for API and Web
make logs-api         # Follow API logs only
make logs-web         # Follow Web logs only
make status           # Show container status and ports

# Database
make db-migrate       # Run Prisma migrations
make db-studio        # Open Prisma Studio

# Production
make prod-build       # Build production images
make prod-up          # Start production stack
make prod-down        # Stop production stack
```

## 🔧 Port Configuration

All ports are configurable via environment variables to avoid conflicts:

| Service | Default Port | Environment Variable |
|---------|--------------|---------------------|
| Web | 3002 | `QM_WEB_PORT` |
| API | 3003 | `QM_API_PORT` |
| PostgreSQL | 5432 | `QM_POSTGRES_PORT` |
| Redis | 6380 | `QM_REDIS_PORT` |
| MinIO API | 9000 | `QM_MINIO_API_PORT` |
| MinIO Console | 9001 | `QM_MINIO_CONSOLE_PORT` |

**Example**: To use alternative ports:

```bash
QM_API_PORT=3100 QM_WEB_PORT=3101 make dev-full
```

Or create a `.env` file in the project root:

```bash
QM_WEB_PORT=3100
QM_API_PORT=3101
QM_POSTGRES_PORT=5433
QM_REDIS_PORT=6381
```

## 🩺 Health Checks

The application includes health check endpoints for monitoring:

- **API Health**: `GET /health` - Basic liveness check
- **API Ready**: `GET /health/ready` - Readiness check (includes database)
- **Web Health**: `GET /api/health` - Frontend liveness check

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Complete technical documentation
- [SETUP.md](./SETUP.md) - Setup guide and getting started
- [DOCKER.md](./DOCKER.md) - Docker configuration and troubleshooting

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

Private - All rights reserved
