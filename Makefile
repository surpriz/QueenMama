# =============================================================================
# Queen Mama - Makefile
# =============================================================================
# Usage:
#   make help         - Show available commands
#   make dev          - Start infrastructure + run dev locally
#   make dev-full     - Start everything in Docker
#   make rebuild      - Clean volumes + rebuild (fixes Prisma issues)
# =============================================================================

.PHONY: help dev dev-full dev-infra rebuild clean clean-volumes logs logs-api logs-web status stop build prod-build prod-up prod-down db-migrate db-studio

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# =============================================================================
# Help
# =============================================================================
help:
	@echo ""
	@echo "$(CYAN)Queen Mama - Docker Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Development:$(RESET)"
	@echo "  make dev           Start infrastructure (DB, Redis, MinIO) + hint for local dev"
	@echo "  make dev-full      Start ALL services in Docker (API + Web + infra)"
	@echo "  make dev-infra     Start only infrastructure services"
	@echo "  make stop          Stop all containers"
	@echo ""
	@echo "$(GREEN)Maintenance:$(RESET)"
	@echo "  make rebuild       Clean node_modules volumes + rebuild (fixes Prisma issues)"
	@echo "  make clean         Stop containers and remove volumes"
	@echo "  make clean-volumes Remove only node_modules volumes (keep data)"
	@echo ""
	@echo "$(GREEN)Logs & Status:$(RESET)"
	@echo "  make logs          Follow logs for API and Web"
	@echo "  make logs-api      Follow API logs only"
	@echo "  make logs-web      Follow Web logs only"
	@echo "  make status        Show container status and ports"
	@echo ""
	@echo "$(GREEN)Database:$(RESET)"
	@echo "  make db-migrate    Run Prisma migrations"
	@echo "  make db-studio     Open Prisma Studio"
	@echo ""
	@echo "$(GREEN)Production:$(RESET)"
	@echo "  make prod-build    Build production images"
	@echo "  make prod-up       Start production stack"
	@echo "  make prod-down     Stop production stack"
	@echo ""

# =============================================================================
# Development
# =============================================================================

## Start infrastructure only (recommended for local development)
dev-infra:
	@echo "$(CYAN)Starting infrastructure services...$(RESET)"
	docker compose up -d postgres redis minio
	@echo ""
	@echo "$(GREEN)Infrastructure is ready!$(RESET)"
	@echo "  PostgreSQL: localhost:$${QM_POSTGRES_PORT:-5432}"
	@echo "  Redis:      localhost:$${QM_REDIS_PORT:-6380}"
	@echo "  MinIO:      localhost:$${QM_MINIO_API_PORT:-9000} (API) / localhost:$${QM_MINIO_CONSOLE_PORT:-9001} (Console)"

## Start infrastructure + show instructions for local development
dev: dev-infra
	@echo ""
	@echo "$(YELLOW)To start development servers locally:$(RESET)"
	@echo "  Terminal 1: pnpm run dev --filter=@queen-mama/api"
	@echo "  Terminal 2: pnpm run dev --filter=@queen-mama/web"
	@echo ""
	@echo "$(YELLOW)Or use 'make dev-full' to run everything in Docker$(RESET)"

## Start ALL services in Docker (API + Web + infrastructure)
dev-full:
	@echo "$(CYAN)Starting all services in Docker...$(RESET)"
	docker compose up -d
	@echo ""
	@echo "$(GREEN)All services started!$(RESET)"
	@make status

## Stop all containers
stop:
	@echo "$(CYAN)Stopping all containers...$(RESET)"
	docker compose down
	@echo "$(GREEN)Done!$(RESET)"

# =============================================================================
# Maintenance & Cleanup
# =============================================================================

## Clean node_modules volumes and rebuild (fixes Prisma binary issues)
rebuild:
	@echo "$(YELLOW)Cleaning node_modules volumes and rebuilding...$(RESET)"
	@echo "This will fix Prisma binary mismatch issues."
	@echo ""
	docker compose down
	@echo "$(CYAN)Removing node_modules volumes...$(RESET)"
	-docker volume rm qm_api_node_modules qm_packages qm_web_node_modules qm_web_next 2>/dev/null || true
	@echo "$(CYAN)Rebuilding images...$(RESET)"
	docker compose build --no-cache
	@echo ""
	@echo "$(GREEN)Rebuild complete!$(RESET)"
	@echo "Run 'make dev-full' to start services."

## Remove only node_modules volumes (keep data volumes)
clean-volumes:
	@echo "$(YELLOW)Removing node_modules volumes...$(RESET)"
	docker compose down
	-docker volume rm qm_api_node_modules qm_packages qm_web_node_modules qm_web_next 2>/dev/null || true
	@echo "$(GREEN)Node modules volumes removed.$(RESET)"
	@echo "Data volumes (postgres, redis, minio) are preserved."

## Stop containers and remove ALL volumes (including data!)
clean:
	@echo "$(RED)WARNING: This will remove ALL volumes including database data!$(RESET)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down -v
	@echo "$(GREEN)All containers and volumes removed.$(RESET)"

# =============================================================================
# Logs & Status
# =============================================================================

## Follow logs for API and Web
logs:
	docker compose logs -f api web

## Follow API logs only
logs-api:
	docker compose logs -f api

## Follow Web logs only
logs-web:
	docker compose logs -f web

## Show container status and ports
status:
	@echo ""
	@echo "$(CYAN)Container Status:$(RESET)"
	@docker compose ps
	@echo ""
	@echo "$(CYAN)Service URLs:$(RESET)"
	@echo "  Web:        http://localhost:$${QM_WEB_PORT:-3002}"
	@echo "  API:        http://localhost:$${QM_API_PORT:-3003}"
	@echo "  API Health: http://localhost:$${QM_API_PORT:-3003}/health"
	@echo "  PostgreSQL: localhost:$${QM_POSTGRES_PORT:-5432}"
	@echo "  Redis:      localhost:$${QM_REDIS_PORT:-6380}"
	@echo "  MinIO API:  http://localhost:$${QM_MINIO_API_PORT:-9000}"
	@echo "  MinIO UI:   http://localhost:$${QM_MINIO_CONSOLE_PORT:-9001}"
	@echo ""

# =============================================================================
# Database
# =============================================================================

## Run Prisma migrations
db-migrate:
	@echo "$(CYAN)Running Prisma migrations...$(RESET)"
	docker compose exec api npx prisma migrate deploy --schema=/app/packages/database/prisma/schema.prisma

## Open Prisma Studio (run locally, connects to Docker DB)
db-studio:
	@echo "$(CYAN)Starting Prisma Studio...$(RESET)"
	@echo "Make sure DATABASE_URL is set in your environment or .env file"
	cd packages/database && pnpm run studio

# =============================================================================
# Build
# =============================================================================

## Build Docker images
build:
	@echo "$(CYAN)Building Docker images...$(RESET)"
	docker compose build

# =============================================================================
# Production
# =============================================================================

## Build production images
prod-build:
	@echo "$(CYAN)Building production images...$(RESET)"
	docker compose -f docker-compose.prod.yml build

## Start production stack
prod-up:
	@echo "$(CYAN)Starting production stack...$(RESET)"
	docker compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "$(GREEN)Production stack started!$(RESET)"
	@echo "Run 'docker compose -f docker-compose.prod.yml logs -f' to view logs"

## Stop production stack
prod-down:
	@echo "$(CYAN)Stopping production stack...$(RESET)"
	docker compose -f docker-compose.prod.yml down
