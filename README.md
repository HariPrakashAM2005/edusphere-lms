# 🎓 EduSphere LMS – Production Deployment Guide

A full-featured Learning Management System with real-time grading, assessments, AI assistance, and role-based portals.

---

## 🏗️ Architecture Overview

```
Internet
    │
    ▼
 Nginx (SSL + Load Balancer) :443/:80
    ├── edusphere.com        → Student Portal (Next.js :3000)
    ├── api.edusphere.com    → Backend API (Node.js :3001)
    ├── admin.edusphere.com  → Admin/Faculty Panel (Next.js :3002)
    └── db.edusphere.com     → Adminer (IP-restricted :8080)
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                    MySQL 8.0              Redis 7.2
                  (Persistent)          (Cache + Pub/Sub)
```

## 📦 Services

| Service | Image | Port | Description |
|---|---|---|---|
| `nginx` | nginx:1.25-alpine | 80, 443 | Reverse proxy + SSL |
| `backend` | edusphere/backend | 3001 | Node.js API + Socket.io |
| `frontend` | edusphere/frontend | 3000 | Student portal (Next.js) |
| `admin` | edusphere/admin | 3002 | Faculty/Admin panel (Next.js) |
| `mysql` | mysql:8.0 | 3306 | Primary database |
| `redis` | redis:7.2-alpine | 6379 | Cache + session store |
| `adminer` | adminer:4.8.1 | 8080 | DB management (internal) |

---

## 🚀 Quick Start – Local Development

```bash
# 1. Start infrastructure (DB + Redis)
docker compose up -d mysql redis

# 2. Start backend
cd backend && npm run dev      # → http://localhost:3001

# 3. Start student portal
cd frontend && npm run dev     # → http://localhost:3000

# 4. Start admin panel
cd backend-admin && npm run dev  # → http://localhost:3002
```

### Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@edusphere.com | admin123 |
| Faculty | faculty@edusphere.com | faculty123 |
| Student | student@edusphere.com | student123 |

---

## 🏭 Production Deployment

### Prerequisites

- Ubuntu 22.04 LTS server (min 2 vCPU, 4GB RAM)
- Docker 24+ and Docker Compose v2
- Domain names pointing to your server
- SSL certificates (via Let's Encrypt / Certbot)

### Step 1 – Clone and Configure

```bash
git clone https://github.com/your-org/edusphere.git /opt/edusphere
cd /opt/edusphere

# Copy and fill in production secrets
cp .env.production .env.production.local
nano .env.production.local   # Fill in all CHANGE_ME values
```

### Step 2 – SSL Certificates

```bash
# Install Certbot
sudo apt install certbot

# Obtain certificates for all domains
sudo certbot certonly --standalone \
  -d edusphere.com \
  -d www.edusphere.com \
  -d api.edusphere.com \
  -d admin.edusphere.com \
  -d db.edusphere.com

# Copy to infra/ssl/
mkdir -p infra/ssl/edusphere.com infra/ssl/api.edusphere.com \
         infra/ssl/admin.edusphere.com infra/ssl/db.edusphere.com

sudo cp /etc/letsencrypt/live/edusphere.com/fullchain.pem infra/ssl/edusphere.com/
sudo cp /etc/letsencrypt/live/edusphere.com/privkey.pem infra/ssl/edusphere.com/
# Repeat for other subdomains...
```

### Step 3 – Deploy

```bash
# First deployment (with build + migrate + seed)
chmod +x deploy.sh
./deploy.sh --build --migrate --seed

# Subsequent deployments
./deploy.sh --build
```

### Step 4 – Verify

```bash
# Check all containers are healthy
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f backend

# Test API
curl https://api.edusphere.com/health
```

---

## 🔄 CI/CD (GitHub Actions)

Set the following secrets in your GitHub repository:

| Secret | Description |
|---|---|
| `PROD_SERVER_HOST` | Production server IP/hostname |
| `PROD_SERVER_USER` | SSH username |
| `PROD_SSH_KEY` | Private SSH key for server |
| `NEXT_PUBLIC_API_URL` | https://api.edusphere.com/api |
| `NEXT_PUBLIC_SOCKET_URL` | https://api.edusphere.com |

Push to `main` → automatically builds, tests, and deploys.

---

## 🛠️ Management Commands

```bash
# View all service logs
docker compose -f docker-compose.prod.yml logs -f

# Restart a specific service
docker compose -f docker-compose.prod.yml restart backend

# Run database migrations
docker compose -f docker-compose.prod.yml run --rm migrator

# Access MySQL CLI
docker compose -f docker-compose.prod.yml exec mysql \
  mysql -u edusphere_user -p edusphere

# Access Redis CLI
docker compose -f docker-compose.prod.yml exec redis \
  redis-cli -a YOUR_REDIS_PASSWORD

# Scale backend (multiple instances)
docker compose -f docker-compose.prod.yml up -d --scale backend=3

# Stop all services
docker compose -f docker-compose.prod.yml down

# Full cleanup (WARNING: destroys all data)
docker compose -f docker-compose.prod.yml down -v --rmi all
```

---

## 📁 Project Structure

```
edusphere/
├── backend/                  # Node.js + Express + Prisma API
│   ├── src/
│   │   ├── modules/          # Feature modules (auth, assessment, etc.)
│   │   ├── middleware/       # Auth, rate limiting
│   │   ├── socket/           # Real-time Socket.io events
│   │   └── index.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   ├── Dockerfile.backend.prod
│   └── ecosystem.config.js   # PM2 clustering config
├── frontend/                 # Student portal (Next.js 14)
│   ├── app/                  # App Router pages
│   ├── components/           # Reusable UI components
│   └── next.config.js        # Production config (standalone)
├── backend-admin/            # Faculty/Admin panel (Next.js 16)
│   └── next.config.ts        # Production config (standalone)
├── infra/
│   ├── nginx/                # Nginx reverse proxy config
│   │   ├── nginx.conf        # Main Nginx configuration
│   │   └── snippets/         # SSL + proxy params
│   └── mysql/
│       ├── my.cnf            # MySQL performance tuning
│       └── init.sql          # Initial DB setup
├── .github/workflows/
│   └── deploy.yml            # CI/CD pipeline
├── docker-compose.yml        # Development compose
├── docker-compose.prod.yml   # Production compose
├── Dockerfile.frontend.prod  # Shared Next.js Dockerfile
├── .env.production           # Production env template
├── .gitignore
└── deploy.sh                 # Deployment script
```

---

## 🔒 Security Checklist

- [ ] All `CHANGE_ME` values in `.env.production` replaced with real secrets
- [ ] JWT secrets are 64+ random characters
- [ ] SSL certificates installed and auto-renewing
- [ ] Admin panel restricted to allowlisted IPs in `nginx.conf`
- [ ] Adminer only accessible via IP-restricted subdomain
- [ ] MySQL root password changed from default
- [ ] Redis password set
- [ ] `.env.production` excluded from git (check `.gitignore`)
- [ ] Rate limiting configured appropriately
- [ ] Regular database backups scheduled

---

## 📞 Support

| Component | Documentation |
|---|---|
| Next.js | https://nextjs.org/docs |
| Prisma | https://www.prisma.io/docs |
| Socket.io | https://socket.io/docs |
| Docker Compose | https://docs.docker.com/compose/ |
| PM2 | https://pm2.keymetrics.io/docs |
