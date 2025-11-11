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

### 5. Docker Configuration
- ✅ docker-compose.yml for local development
- ✅ Dockerfiles for API and Web
- ✅ PostgreSQL, Redis, MinIO services configured

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
docker-compose up -d postgres redis minio
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO on ports 9000 (API) and 9001 (Console)

### 2. Run Database Migrations

```bash
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

```bash
pnpm run dev
```

This will start:
- Frontend on http://localhost:3002
- API on http://localhost:3001
- API Docs on http://localhost:3001/api-docs

---

## 📚 Useful Commands

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

## 🆘 Troubleshooting

### Docker Issues
- Make sure Docker Desktop is running
- Run `docker-compose down` and then `docker-compose up -d` to restart

### Port Already in Use
- Check if ports 3000, 3001, 5432, 6379, 9000, 9001 are free
- Kill processes using these ports or change ports in configuration

### Prisma Client Not Found
- Run `pnpm run db:generate` to regenerate the Prisma client

### Dependencies Issues
- Delete `node_modules` and `pnpm-lock.yaml`
- Run `pnpm install --frozen-lockfile`

---

## 📞 Support

For any issues or questions:
- Check the main documentation in [claude.md](./claude.md)
- Create an issue on GitHub
- Email: jerome@jaap.fr

---

**Happy Coding! 🎉**
