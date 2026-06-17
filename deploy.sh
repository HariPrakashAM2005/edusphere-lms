#!/usr/bin/env bash
# ════════════════════════════════════════════════════════
#  EduSphere LMS – Production Deployment Script
#  Usage: ./deploy.sh [--build] [--migrate] [--seed]
# ════════════════════════════════════════════════════════
set -euo pipefail

# ── Colors ───────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} $*"; }
ok()   { echo -e "${GREEN}✔${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC} $*"; }
fail() { echo -e "${RED}✖ ERROR:${NC} $*"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.production"

# ── Parse flags ──────────────────────────────────────────
DO_BUILD=false
DO_MIGRATE=false
DO_SEED=false

for arg in "$@"; do
  case $arg in
    --build)   DO_BUILD=true ;;
    --migrate) DO_MIGRATE=true ;;
    --seed)    DO_SEED=true ;;
    --help)
      echo "Usage: $0 [--build] [--migrate] [--seed]"
      echo "  --build    Rebuild Docker images before deploying"
      echo "  --migrate  Run Prisma migrations"
      echo "  --seed     Seed the database with initial data"
      exit 0 ;;
    *) warn "Unknown argument: $arg" ;;
  esac
done

# ── Checks ───────────────────────────────────────────────
log "Starting EduSphere LMS deployment..."
echo -e "${BLUE}═══════════════════════════════════════${NC}"

[[ -f "$ENV_FILE" ]] || fail ".env.production not found at $ENV_FILE"
command -v docker &>/dev/null || fail "Docker is not installed"
command -v docker &>/dev/null && docker compose version &>/dev/null || fail "Docker Compose v2 is not installed"

# Load env
set -a; source "$ENV_FILE"; set +a
ok "Environment loaded"

# ── Generate DH params if missing ────────────────────────
DHPARAM="$SCRIPT_DIR/infra/nginx/dhparam.pem"
if [[ ! -f "$DHPARAM" ]]; then
  log "Generating 2048-bit DH parameters (this may take a minute)..."
  openssl dhparam -out "$DHPARAM" 2048
  ok "DH params generated"
fi

# ── Build images ─────────────────────────────────────────
if [[ "$DO_BUILD" == true ]]; then
  log "Building Docker images..."
  docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" build \
    --parallel --no-cache
  ok "Images built"
fi

# ── Pull latest base images ──────────────────────────────
log "Pulling latest base images..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" pull \
  mysql redis nginx adminer 2>/dev/null || true

# ── Start infrastructure (DB + Redis) ────────────────────
log "Starting MySQL and Redis..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
  up -d mysql redis

log "Waiting for database to be healthy..."
until docker compose -f docker-compose.prod.yml exec -T mysql \
  mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" &>/dev/null; do
  echo -n "."
  sleep 2
done
echo ""
ok "Database is ready"

# ── Run migrations ───────────────────────────────────────
if [[ "$DO_MIGRATE" == true ]]; then
  log "Running Prisma migrations..."
  docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
    run --rm migrator
  ok "Migrations complete"
fi

# ── Seed database ────────────────────────────────────────
if [[ "$DO_SEED" == true ]]; then
  log "Seeding database..."
  docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
    run --rm migrator npx prisma db seed
  ok "Database seeded"
fi

# ── Deploy application stack ─────────────────────────────
log "Deploying application services..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
  up -d --remove-orphans

# ── Health checks ────────────────────────────────────────
log "Waiting for services to be healthy..."
sleep 10

check_health() {
  local svc=$1 url=$2
  if curl -fsS "$url" &>/dev/null; then
    ok "$svc is healthy"
  else
    warn "$svc may not be fully ready yet (check logs with: docker compose logs $svc)"
  fi
}

check_health "Backend API"      "http://localhost:3001/health"
check_health "Student Frontend" "http://localhost:3000"
check_health "Admin Panel"      "http://localhost:3002"

# ── Summary ──────────────────────────────────────────────
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 EduSphere LMS Deployment Complete!${NC}"
echo ""
echo -e "  ${CYAN}Frontend:${NC}   https://edusphere.com"
echo -e "  ${CYAN}API:${NC}        https://api.edusphere.com"
echo -e "  ${CYAN}Admin:${NC}      https://admin.edusphere.com"
echo -e "  ${CYAN}DB Admin:${NC}   https://db.edusphere.com (IP-restricted)"
echo ""
echo -e "  View logs:  docker compose -f docker-compose.prod.yml logs -f"
echo -e "  Stop all:   docker compose -f docker-compose.prod.yml down"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
