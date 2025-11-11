# Queen Mama - Lead Generation Platform

> B2B lead generation SaaS platform with pay-per-lead model

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start Docker services
docker-compose up -d postgres redis minio

# Generate Prisma client & run migrations
pnpm run db:generate
pnpm run db:migrate

# Start development servers
pnpm run dev
```

### Access Points
- **Frontend**: http://localhost:3002
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs
- **Prisma Studio**: `pnpm run db:studio`
- **MinIO Console**: http://localhost:9001

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

## 📚 Documentation

See [claude.md](./claude.md) for complete documentation.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

Private - All rights reserved
