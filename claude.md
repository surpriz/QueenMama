# Queen Mama - Lead Generation Platform MVP

## 🎯 Project Overview

Queen Mama is a B2B lead generation SaaS platform that provides qualified leads through automated cold emailing campaigns. Clients define their ICP (Ideal Customer Profile), and the platform handles prospecting, outreach, and delivers only qualified leads that showed interest - with a pay-per-lead model.

**Business Model**: Hybrid subscription + success-based pricing
- Base subscription: 99-999€/month (depending on plan)
- Cost per qualified lead: 20-60€ (volume-based pricing)

**Core Value Proposition**: "Pay only for leads that respond positively to your outreach"

---

## 🏗️ Technical Architecture

### Tech Stack (2025 Best Practices)

#### Frontend
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript 5.3+ (strict mode)
- **Styling**: TailwindCSS 4.0 + shadcn/ui components
- **State Management**: Zustand (lightweight, no boilerplate)
- **Data Fetching**: TanStack Query v5 (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

#### Backend
- **Framework**: NestJS 10+ (TypeScript, enterprise-grade)
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5+ (type-safe, excellent DX)
- **Cache**: Redis 7 (caching + job queues)
- **Job Queue**: BullMQ (background jobs, email sending)
- **Validation**: class-validator + class-transformer
- **API**: RESTful + WebSocket (Socket.io for real-time updates)

#### Authentication & Payments
- **Auth**: Clerk (modern, secure, great DX - includes org/team management)
- **Payments**: Stripe (subscriptions + one-time payments)
- **Email**: Resend (modern transactional emails)

#### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Traefik (auto SSL, load balancing)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (error tracking)
- **Analytics**: PostHog or Plausible (privacy-friendly)
- **Storage**: MinIO (S3-compatible, for attachments/exports)

#### Development Tools
- **Package Manager**: pnpm (faster than npm/yarn)
- **Monorepo**: Turborepo (optimal caching, fast builds)
- **Code Quality**: ESLint + Prettier + Husky (pre-commit hooks)
- **Testing**: Vitest (frontend) + Jest (backend)
- **API Testing**: Bruno or Hoppscotch (open-source Postman alternative)

---

## 📁 Project Structure
```
queen-mama/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       └── deploy.yml             # CD to VPS
├── apps/
│   ├── web/                       # Next.js frontend
│   │   ├── app/                   # App Router
│   │   │   ├── (auth)/           # Auth pages
│   │   │   ├── (dashboard)/      # Protected routes
│   │   │   │   ├── campaigns/
│   │   │   │   ├── leads/
│   │   │   │   └── settings/
│   │   │   ├── (marketing)/      # Public pages
│   │   │   │   ├── page.tsx      # Landing
│   │   │   │   └── pricing/
│   │   │   └── api/              # API routes (webhooks)
│   │   ├── components/
│   │   │   ├── ui/               # shadcn components
│   │   │   ├── campaigns/
│   │   │   ├── leads/
│   │   │   └── layouts/
│   │   ├── lib/
│   │   │   ├── api.ts            # API client
│   │   │   ├── auth.ts           # Clerk helpers
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── stores/               # Zustand stores
│   │   └── types/
│   │
│   └── api/                       # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/         # Authentication
│       │   │   ├── campaigns/    # Campaign management
│       │   │   ├── leads/        # Lead management
│       │   │   ├── customers/    # Customer management
│       │   │   ├── payments/     # Stripe integration
│       │   │   ├── emails/       # Email handling
│       │   │   ├── integrations/ # Apollo, ManyReach APIs
│       │   │   └── jobs/         # Background jobs
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   └── pipes/
│       │   ├── prisma/
│       │   │   ├── schema.prisma
│       │   │   └── migrations/
│       │   └── config/
│       └── test/
│
├── packages/
│   ├── database/                 # Shared Prisma schema
│   ├── typescript-config/        # Shared TS configs
│   └── eslint-config/            # Shared ESLint configs
│
├── docker/
│   ├── api.Dockerfile
│   ├── web.Dockerfile
│   └── nginx.Dockerfile
│
├── docker-compose.yml            # Local development
├── docker-compose.prod.yml       # Production
├── turbo.json                    # Turborepo config
├── pnpm-workspace.yaml
└── README.md
```

---

## 🗄️ Database Schema (Prisma)
```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============= USERS & ORGANIZATIONS =============

model Customer {
  id        String   @id @default(cuid())
  clerkId   String   @unique // Clerk user ID
  email     String   @unique
  firstName String?
  lastName  String?
  company   String?
  role      String?
  
  // Subscription
  plan            Plan     @default(PAY_PER_LEAD)
  stripeCustomerId String?  @unique
  subscriptionId   String?
  subscriptionStatus SubscriptionStatus @default(INACTIVE)
  
  // Billing
  credits         Int      @default(0)
  creditsUsed     Int      @default(0)
  
  campaigns       Campaign[]
  payments        Payment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([clerkId])
  @@index([email])
}

enum Plan {
  PAY_PER_LEAD      // 0€/mo + 60€/lead
  STARTER           // 99€/mo + 30€/lead
  GROWTH            // 299€/mo + 25€/lead
  SCALE             // 999€/mo + 20€/lead
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  PAST_DUE
  CANCELED
  TRIALING
}

// ============= CAMPAIGNS =============

model Campaign {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  name        String
  description String?
  status      CampaignStatus @default(DRAFT)
  
  // ICP (Ideal Customer Profile)
  targetCriteria Json // { industries: [], companySize: [], locations: [], titles: [] }
  
  // Budget & Pricing
  budget          Float
  pricePerLead    Float // Dynamic based on plan
  maxLeads        Int?  // Optional cap
  
  // Email Sequence
  emailSequences  EmailSequence[]
  
  // Stats
  totalContacted  Int @default(0)
  totalReplies    Int @default(0)
  totalQualified  Int @default(0)
  totalPaid       Int @default(0)
  
  leads           Lead[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  startedAt DateTime?
  completedAt DateTime?
  
  @@index([customerId])
  @@index([status])
}

enum CampaignStatus {
  DRAFT          // Being configured
  PENDING_REVIEW // Waiting for admin approval
  WARMUP         // Domain warming phase
  ACTIVE         // Currently running
  PAUSED         // Temporarily stopped
  COMPLETED      // Finished
  CANCELED       // Canceled by user
}

model EmailSequence {
  id          String   @id @default(cuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  step        Int      // 1, 2, 3...
  subject     String
  body        String   @db.Text
  delayDays   Int      // Days after previous email
  
  // Stats
  sent        Int @default(0)
  opened      Int @default(0)
  clicked     Int @default(0)
  replied     Int @default(0)
  
  @@index([campaignId])
}

// ============= LEADS =============

model Lead {
  id          String   @id @default(cuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  customerId  String   // For quick access
  
  // Contact Info (encrypted in production)
  firstName   String
  lastName    String
  email       String
  company     String
  title       String
  linkedinUrl String?
  phone       String?
  
  // Enrichment data
  companySize     String?
  companyIndustry String?
  location        String?
  
  // Status & Qualification
  status          LeadStatus @default(CONTACTED)
  qualityScore    Int?       // 0-100 (AI-generated)
  sentiment       Sentiment? // POSITIVE, NEUTRAL, NEGATIVE
  
  // Interactions
  interactions    Interaction[]
  
  // Payment
  isRevealed      Boolean @default(false)
  revealedAt      DateTime?
  paidAmount      Float?
  paymentId       String?
  payment         Payment? @relation(fields: [paymentId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([campaignId])
  @@index([status])
  @@index([email])
}

enum LeadStatus {
  CONTACTED      // Email sent
  OPENED         // Email opened
  REPLIED        // Replied to email
  INTERESTED     // Positive reply (AI-detected)
  QUALIFIED      // Manually qualified, ready to unlock
  PAID           // Customer paid to reveal contact
  NOT_INTERESTED // Negative reply
  BOUNCED        // Email bounced
  UNSUBSCRIBED   // Unsubscribed
}

enum Sentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

model Interaction {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  type        InteractionType
  content     String?  @db.Text // Email content, encrypted
  metadata    Json?    // { opened: true, clicked: true, links: [] }
  
  createdAt   DateTime @default(now())
  
  @@index([leadId])
  @@index([createdAt])
}

enum InteractionType {
  EMAIL_SENT
  EMAIL_OPENED
  EMAIL_CLICKED
  EMAIL_REPLIED
  EMAIL_BOUNCED
  LINKEDIN_VISITED
  PHONE_CALLED
}

// ============= PAYMENTS =============

model Payment {
  id              String   @id @default(cuid())
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  
  type            PaymentType
  amount          Float
  currency        String @default("EUR")
  
  // Stripe
  stripePaymentIntentId String? @unique
  stripeInvoiceId       String?
  
  status          PaymentStatus @default(PENDING)
  
  // Related entities
  leads           Lead[]
  metadata        Json? // { leadIds: [], campaignId: "" }
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([customerId])
  @@index([status])
}

enum PaymentType {
  SUBSCRIPTION  // Monthly subscription
  LEAD_UNLOCK   // One-time lead unlock
  CREDITS       // Bulk credits purchase
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
  CANCELED
}

// ============= JOBS & SYSTEM =============

model Job {
  id          String   @id @default(cuid())
  name        String   // e.g., "send-email-sequence"
  data        Json     // Job payload
  status      JobStatus @default(PENDING)
  attempts    Int      @default(0)
  maxAttempts Int      @default(3)
  error       String?  @db.Text
  
  scheduledAt DateTime?
  startedAt   DateTime?
  completedAt DateTime?
  
  createdAt DateTime @default(now())
  
  @@index([status])
  @@index([scheduledAt])
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELED
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String   // Clerk ID
  action    String   // e.g., "campaign.created"
  entity    String   // e.g., "Campaign"
  entityId  String
  metadata  Json?
  ipAddress String?
  userAgent String?
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

---

## 🐳 Docker Configuration

### docker-compose.yml (Local Development)
```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: queen-mama-db
    environment:
      POSTGRES_USER: queenmama
      POSTGRES_PASSWORD: dev_password_change_in_prod
      POSTGRES_DB: queenmama
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U queenmama"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache & Queue
  redis:
    image: redis:7-alpine
    container_name: queen-mama-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO (S3-compatible storage)
  minio:
    image: minio/minio:latest
    container_name: queen-mama-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Backend API
  api:
    build:
      context: .
      dockerfile: docker/api.Dockerfile
    container_name: queen-mama-api
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgresql://queenmama:dev_password_change_in_prod@postgres:5432/queenmama
      REDIS_URL: redis://redis:6379
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      RESEND_API_KEY: ${RESEND_API_KEY}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    command: pnpm run start:dev

  # Frontend Web
  web:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
    container_name: queen-mama-web
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next
    command: pnpm run dev

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### docker/api.Dockerfile
```dockerfile
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
```

### docker/web.Dockerfile
```dockerfile
FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile

# Development
FROM base AS development
WORKDIR /app/apps/web
CMD ["pnpm", "run", "dev"]

# Production build
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
RUN pnpm run build --filter=web

# Production
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

---

## 🚀 CI/CD Pipeline

### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm run lint
      
      - name: Type check
        run: pnpm run type-check
      
      - name: Run tests
        run: pnpm run test
      
      - name: Build
        run: pnpm run build

  docker-build:
    runs-on: ubuntu-latest
    needs: lint-and-test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/api.Dockerfile
          target: production
          tags: queen-mama-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/web.Dockerfile
          target: production
          tags: queen-mama-web:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### .github/workflows/deploy.yml
```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Build Docker images
        run: |
          docker build -f docker/api.Dockerfile -t queen-mama-api:latest --target production .
          docker build -f docker/web.Dockerfile -t queen-mama-web:latest --target production .
      
      - name: Save Docker images
        run: |
          docker save queen-mama-api:latest | gzip > api.tar.gz
          docker save queen-mama-web:latest | gzip > web.tar.gz
      
      - name: Copy files to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "api.tar.gz,web.tar.gz,docker-compose.prod.yml"
          target: "/opt/queen-mama"
      
      - name: Deploy on VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/queen-mama
            docker load < api.tar.gz
            docker load < web.tar.gz
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -af
```

---

## 🔐 Environment Variables

### apps/api/.env.example
```bash
# Database
DATABASE_URL="postgresql://queenmama:password@localhost:5432/queenmama"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth (Clerk)
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_STARTER="price_..."
STRIPE_PRICE_ID_GROWTH="price_..."
STRIPE_PRICE_ID_SCALE="price_..."

# Email (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@queenmama.io"

# External APIs
APOLLO_API_KEY="..."
MANYREACH_API_KEY="..."

# Storage (MinIO)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="queen-mama"

# App Config
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"

# Monitoring
SENTRY_DSN="https://..."

# Jobs
QUEUE_CONCURRENCY="5"
```

### apps/web/.env.example
```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://eu.posthog.com"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

---

## 📦 Package Configuration

### package.json (Root)
```json
{
  "name": "queen-mama",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "clean": "turbo run clean",
    "db:generate": "cd packages/database && pnpm run generate",
    "db:push": "cd packages/database && pnpm run push",
    "db:migrate": "cd packages/database && pnpm run migrate",
    "db:studio": "cd packages/database && pnpm run studio"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1",
    "turbo": "^1.11.0",
    "typescript": "^5.3.3"
  },
  "packageManager": "pnpm@8.12.0"
}
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## 🎨 Core Features to Implement (MVP)

### Phase 1: Foundation (Week 1-2)

1. **Setup Infrastructure**
   - ✅ Initialize monorepo with Turborepo
   - ✅ Setup Next.js app with TypeScript
   - ✅ Setup NestJS API with TypeScript
   - ✅ Configure Prisma with PostgreSQL
   - ✅ Setup Docker Compose for local dev
   - ✅ Configure ESLint + Prettier
   - ✅ Setup GitHub Actions CI/CD

2. **Authentication & Authorization**
   - ✅ Integrate Clerk in Next.js
   - ✅ Create Clerk webhook handler in NestJS
   - ✅ Implement JWT auth guard
   - ✅ Create user profile management

3. **Basic UI Components**
   - ✅ Install shadcn/ui
   - ✅ Create layout components (Header, Sidebar, Footer)
   - ✅ Setup theme (light/dark mode)
   - ✅ Create common UI components (Button, Card, Form inputs)

### Phase 2: Core Features (Week 3-4)

4. **Campaign Management**
   - ✅ Campaign CRUD operations (API)
   - ✅ Campaign creation flow (UI)
     - ICP form (industries, company sizes, locations, titles)
     - Email sequence builder
     - Budget & pricing settings
   - ✅ Campaign dashboard
     - List all campaigns
     - View campaign stats
     - Pause/resume/cancel campaign

5. **Lead Management**
   - ✅ Lead CRUD operations (API)
   - ✅ Lead listing with filters
   - ✅ Lead detail view (with masked contact info)
   - ✅ Lead unlock flow (payment integration)

6. **Payment Integration (Stripe)**
   - ✅ Setup Stripe customer on user registration
   - ✅ Subscription checkout flow
   - ✅ One-time payment for lead unlock
   - ✅ Webhook handler for payment events
   - ✅ Billing history page

### Phase 3: Automation (Week 5-6)

7. **Admin Interface**
   - ✅ Admin dashboard (campaign review queue)
   - ✅ Manual lead upload (CSV import)
   - ✅ Campaign approval/rejection flow
   - ✅ Analytics overview

8. **Email & Job Queue**
   - ✅ Setup BullMQ queues
   - ✅ Email sending job (via Resend)
   - ✅ Campaign status update jobs
   - ✅ Lead scoring background job

9. **Analytics & Reporting**
   - ✅ Campaign performance metrics
   - ✅ Lead funnel visualization
   - ✅ Revenue tracking dashboard
   - ✅ Export reports (CSV, PDF)

---

## 🎯 MVP Success Criteria

**Functional Requirements:**
- ✅ User can sign up and subscribe to a plan
- ✅ User can create a campaign with ICP and email sequences
- ✅ Admin can review and approve campaigns
- ✅ Admin can manually upload leads and responses
- ✅ User can see qualified leads (with masked contacts)
- ✅ User can pay to unlock lead contacts
- ✅ Stripe payments work end-to-end
- ✅ Email notifications work (transactional)

**Non-Functional Requirements:**
- ✅ Responsive UI (mobile-friendly)
- ✅ Fast page loads (<2s)
- ✅ Secure (HTTPS, encrypted data)
- ✅ Docker-based deployment
- ✅ CI/CD pipeline functional

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL client (optional, for direct DB access)

### Installation Steps
```bash
# 1. Clone repo
git clone <your-repo-url>
cd queen-mama

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit .env files with your keys (Clerk, Stripe, etc.)

# 4. Start Docker services
docker-compose up -d postgres redis minio

# 5. Generate Prisma client & run migrations
pnpm run db:generate
pnpm run db:migrate

# 6. Seed database (optional)
cd apps/api && pnpm run seed

# 7. Start development servers
pnpm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs (Swagger)
- **Prisma Studio**: `pnpm run db:studio` → http://localhost:5555
- **MinIO Console**: http://localhost:9001

---

## 🧪 Testing Strategy

### Unit Tests
- Vitest for frontend components
- Jest for backend services
- Target: >80% coverage

### Integration Tests
- API endpoint tests with Supertest
- Database tests with test containers
- Stripe webhook tests with mocked requests

### E2E Tests (Future)
- Playwright for critical user flows
- Test scenarios:
  - User signup → create campaign → view leads → unlock lead

---

## 📝 Code Style & Best Practices

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Use Zod for runtime validation

### React/Next.js
- Use Server Components by default
- Client Components only when needed (interactivity)
- Use `use server` for server actions
- Prefer composition over props drilling

### NestJS
- Follow SOLID principles
- Use DTOs for validation
- Implement guards for auth
- Use interceptors for logging/transformation
- Use pipes for validation

### Git Workflow
- Branch naming: `feature/campaign-creation`, `fix/payment-webhook`
- Commit messages: Conventional Commits format
- PR template with checklist
- Squash merge to main

---

## 🔒 Security Checklist

- ✅ Encrypt sensitive data (emails, phone numbers) at rest
- ✅ Use parameterized queries (Prisma does this)
- ✅ Implement rate limiting (Redis-based)
- ✅ Validate all inputs (Zod schemas)
- ✅ Sanitize user-generated content
- ✅ CORS configuration (whitelist frontend domain)
- ✅ Helmet.js for security headers
- ✅ CSRF protection for forms
- ✅ Secure cookies (httpOnly, secure, sameSite)
- ✅ Stripe webhook signature verification
- ✅ Clerk webhook signature verification

---

## 📊 Monitoring & Observability

### Error Tracking
- **Sentry** for frontend & backend errors
- Alert on critical errors (payment failures, job failures)

### Logging
- **Pino** logger in NestJS (structured JSON logs)
- Log levels: error, warn, info, debug
- Log aggregation with Loki (future)

### Metrics (Future)
- Prometheus for application metrics
- Grafana dashboards
- Key metrics:
  - API response times
  - Job queue length
  - Database query performance
  - Payment success rate

---

## 🎨 Design System (shadcn/ui)

### Color Palette
```css
/* apps/web/app/globals.css */
:root {
  --primary: 262 83% 58%;        /* Purple */
  --secondary: 217 91% 60%;      /* Blue */
  --success: 142 71% 45%;        /* Green */
  --warning: 38 92% 50%;         /* Orange */
  --error: 0 84% 60%;            /* Red */
  --background: 0 0% 100%;       /* White */
  --foreground: 222 47% 11%;     /* Dark Gray */
}

.dark {
  --primary: 262 83% 58%;
  --background: 222 47% 11%;
  --foreground: 0 0% 100%;
}
```

### Typography
- Font: Inter (Google Fonts)
- Headings: 700 weight
- Body: 400 weight
- Code: Fira Code

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Learning Resources
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [NestJS Fundamentals](https://courses.nestjs.com)

---

## 🚀 Next Steps After MVP

### Phase 2: Semi-Automation (Month 2-3)
- Apollo.io API integration (auto-scraping)
- ManyReach API integration (auto-sending)
- Background job scheduler (cron jobs)
- Email reply parser (NLP-based)
- Advanced analytics dashboard

### Phase 3: AI Features (Month 4-6)
- GPT-4 email sequence generator
- Lead scoring AI model
- Response sentiment analysis
- Dynamic personalization engine
- Smart follow-up recommendations

### Phase 4: Scale (Month 7-12)
- Multi-channel outreach (LinkedIn, SMS)
- Team collaboration features
- White-label solution
- API for integrations
- Mobile app (React Native)

---

## 🤝 Contributing Guidelines

### Code Review Checklist
- [ ] Code follows TypeScript/React best practices
- [ ] All tests pass
- [ ] No console.logs in production code
- [ ] Environment variables are documented
- [ ] API endpoints have Swagger documentation
- [ ] Error handling is comprehensive
- [ ] Performance considerations addressed
- [ ] Security best practices followed

---

## 📞 Support & Feedback

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Email**: jerome@jaap.fr (for urgent issues)

---

**Last Updated**: November 2025
**Version**: 0.1.0 (MVP)
**Author**: Jérôme (JAAP v2)