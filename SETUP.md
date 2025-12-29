# Queen Mama - Setup Guide

## ✅ What's Been Done

The complete infrastructure for Queen Mama MVP has been set up:

### 1. Monorepo Structure
- ✅ Turborepo configuration
- ✅ pnpm workspace setup
- ✅ Shared TypeScript and ESLint configs

### 2. Frontend (Next.js 15)
- ✅ App Router structure
- ✅ TypeScript configuration
- ✅ TailwindCSS + shadcn/ui ready
- ✅ Basic layout and page

### 3. Backend (NestJS 10)
- ✅ Complete API structure
- ✅ TypeScript configuration
- ✅ Swagger API documentation setup
- ✅ Health check endpoint

### 4. Database (Prisma)
- ✅ Complete database schema with all models
- ✅ PostgreSQL configuration
- ✅ Prisma Client generated

### 5. Docker Configuration (Optimized)
- ✅ Multi-stage Dockerfiles with layer caching
- ✅ Named volumes for node_modules (prevents stale Prisma binaries)
- ✅ Configurable ports via environment variables
- ✅ docker-compose.yml for local development
- ✅ docker-compose.prod.yml for production (Traefik + SSL)
- ✅ Makefile with useful commands
- ✅ Health check endpoints on API and Web
- ✅ Multi-platform Prisma binaryTargets (arm64 + x64)
- ✅ .dockerignore for optimized build context

### 6. CI/CD
- ✅ GitHub Actions workflows for CI and deployment
- ✅ ESLint, Prettier, and Husky pre-commit hooks

### 7. Environment Setup
- ✅ .env.example files created
- ✅ .env files created (need to fill API keys)

---

## 🚀 Next Steps

### 1. Start Docker Services

First, **start Docker Desktop** on your Mac, then run:

```bash
# Recommended: Start infrastructure only
make dev

# Or: Start everything in Docker
make dev-full
```

The `make dev` command will start:
- PostgreSQL on port 5432
- Redis on port 6380
- MinIO on ports 9000 (API) and 9001 (Console)

**Note**: If you encounter port conflicts, see the [Port Configuration](#-port-configuration) section below.

### 2. Run Database Migrations

```bash
pnpm run db:generate
pnpm run db:migrate
```

### 3. Configure API Keys

Edit the following files and add your API keys:

**apps/api/.env:**
- `CLERK_SECRET_KEY` - Get from https://clerk.com
- `STRIPE_SECRET_KEY` - Get from https://stripe.com
- `RESEND_API_KEY` - Get from https://resend.com

**apps/web/.env.local:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from Clerk
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Get from Stripe

### 4. Start Development Servers

#### Option A: Local Development (Recommended)

```bash
# Terminal 1 - API
pnpm run dev --filter=@queen-mama/api

# Terminal 2 - Web
pnpm run dev --filter=@queen-mama/web
```

Access points:
- Frontend: http://localhost:3002
- API: http://localhost:3003
- API Health: http://localhost:3003/health
- API Docs: http://localhost:3003/api-docs

#### Option B: Everything in Docker

```bash
make dev-full
```

Check status with:
```bash
make status
```

---

## 📚 Useful Commands

### pnpm Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Push schema to database (without migrations)
pnpm run db:push

# Open Prisma Studio (database GUI)
pnpm run db:studio

# Build all apps
pnpm run build

# Run linting
pnpm run lint

# Type check
pnpm run type-check

# Run tests
pnpm run test

# Clean build artifacts
pnpm run clean
```

### Docker/Makefile Commands

```bash
# Development
make dev              # Start infrastructure only (recommended)
make dev-full         # Start all services in Docker
make stop             # Stop all containers

# Maintenance
make rebuild          # Clean volumes + rebuild (fixes Prisma issues)
make clean-volumes    # Remove node_modules volumes only
make clean            # Remove all containers and volumes

# Logs & Monitoring
make logs             # Follow API and Web logs
make logs-api         # Follow API logs only
make logs-web         # Follow Web logs only
make status           # Show container status and ports

# Database
make db-migrate       # Run Prisma migrations in Docker
make db-studio        # Open Prisma Studio

# Production
make prod-build       # Build production images
make prod-up          # Start production stack
make prod-down        # Stop production stack
```

---

## 🔧 Development Workflow

### Creating a New Feature

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `pnpm run test`
4. Commit: `git commit -m "feat: your feature description"`
5. Push: `git push origin feature/your-feature-name`
6. Create a Pull Request

### Adding a New API Module

```bash
cd apps/api
nest generate module modules/your-module
nest generate controller modules/your-module
nest generate service modules/your-module
```

---

## 📦 Project Structure

```
queen-mama/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # NestJS backend
├── packages/
│   ├── database/         # Prisma schema
│   ├── typescript-config/
│   └── eslint-config/
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
└── docker-compose.yml
```

---

## 🎯 Roadmap

### Week 1-2: Infrastructure & Auth ✅ DONE
- ✅ Monorepo setup
- ✅ Next.js and NestJS apps
- ✅ Prisma schema
- ✅ Docker configuration
- ⏭️ Integrate Clerk authentication
- ⏭️ Setup shadcn/ui components

### Week 3-4: Core Features
- Campaign management (CRUD)
- Lead management (CRUD)
- Stripe payment integration
- Admin interface for manual operations

### Week 5-6: Automation & Jobs
- BullMQ job queues
- Email sending via Resend
- CSV import for leads
- Analytics dashboard

---

## 🔧 Port Configuration

All ports are configurable to avoid conflicts with other Docker applications:

| Service | Default Port | Environment Variable |
|---------|--------------|---------------------|
| Web | 3002 | `QM_WEB_PORT` |
| API | 3003 | `QM_API_PORT` |
| PostgreSQL | 5432 | `QM_POSTGRES_PORT` |
| Redis | 6380 | `QM_REDIS_PORT` |
| MinIO API | 9000 | `QM_MINIO_API_PORT` |
| MinIO Console | 9001 | `QM_MINIO_CONSOLE_PORT` |

### Changing Ports

Create a `.env` file in the project root:

```bash
QM_WEB_PORT=3100
QM_API_PORT=3101
QM_POSTGRES_PORT=5433
QM_REDIS_PORT=6381
QM_MINIO_API_PORT=9010
QM_MINIO_CONSOLE_PORT=9011
```

Or use environment variables directly:

```bash
QM_API_PORT=3100 QM_WEB_PORT=3101 make dev-full
```

---

## 🆘 Troubleshooting

### Docker Issues

**Docker Desktop not running:**
```bash
# Make sure Docker Desktop is running first
make status
```

**Services won't start:**
```bash
# Restart Docker services
make stop
make dev
```

**Stale Prisma binaries / "Binary targets mismatch" error:**
```bash
# Clean volumes and rebuild
make rebuild
```

### Port Already in Use

If you see "port is already allocated" errors:

1. **Option 1**: Use alternative ports (recommended)
   ```bash
   QM_API_PORT=3100 QM_WEB_PORT=3101 make dev-full
   ```

2. **Option 2**: Find and kill the process using the port
   ```bash
   # macOS/Linux
   lsof -ti:3003 | xargs kill -9
   ```

3. **Option 3**: Create a `.env` file with custom ports (see [Port Configuration](#-port-configuration))

### Prisma Client Not Found

```bash
# Regenerate Prisma client
pnpm run db:generate
```

**If using Docker:**
```bash
make rebuild
```

### Dependencies Issues

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install --frozen-lockfile
```

**If using Docker:**
```bash
# Remove node_modules volumes and rebuild
make clean-volumes
docker compose build
```

### Volume Permission Issues

If you encounter permission errors with Docker volumes:

```bash
# Remove volumes and recreate
make clean-volumes
make dev-full
```

### Health Check Failures

Check if services are healthy:

```bash
make status

# Test health endpoints manually
curl http://localhost:3003/health
curl http://localhost:3003/health/ready
curl http://localhost:3002/api/health
```

---

## 📞 Support

For any issues or questions:
- Check the main documentation in [CLAUDE.md](./CLAUDE.md)
- Docker-specific issues: see [DOCKER.md](./DOCKER.md)
- Create an issue on GitHub
- Email: jerome@jaap.fr

---

**Happy Coding! 🎉**
