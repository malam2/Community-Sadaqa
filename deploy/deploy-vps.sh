#!/bin/bash
# Quick VPS/VM Deployment with Docker Compose
# Use this for Azure VM, DigitalOcean, Linode, etc.

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Quick VPS Deployment for Community-Sadaqa${NC}"
echo "=============================================="

# Check if .env.production exists
if [ ! -f deploy/env/.env.production ]; then
    echo "Creating .env.production from template..."
    cp deploy/env/.env.production.example deploy/env/.env.production
    echo -e "${YELLOW}⚠️  Please edit deploy/env/.env.production with your credentials before proceeding${NC}"
    exit 1
fi

# Check if Caddyfile is configured
if grep -q "YOUR_DOMAIN.com" deploy/docker/Caddyfile; then
    echo -e "${YELLOW}⚠️  Please update deploy/docker/Caddyfile with your actual domain${NC}"
    echo "Replace 'YOUR_DOMAIN.com' with your domain (e.g., sadaqa.yourdomain.com)"
    exit 1
fi

echo -e "${YELLOW}Step 1: Loading environment variables...${NC}"
source deploy/env/.env.production

echo -e "${YELLOW}Step 2: Building containers...${NC}"
docker compose -f deploy/docker/docker-compose.prod.yml build

echo -e "${YELLOW}Step 3: Starting services...${NC}"
docker compose -f deploy/docker/docker-compose.prod.yml up -d

echo -e "${YELLOW}Step 4: Waiting for database to be ready...${NC}"
sleep 10

echo -e "${YELLOW}Step 5: Running database migrations...${NC}"
docker compose -f deploy/docker/docker-compose.prod.yml exec server npm run db:push || echo "Run db:push locally with production DATABASE_URL"

echo -e "\n${GREEN}=============================================="
echo -e "🎉 DEPLOYMENT COMPLETE!"
echo -e "==============================================${NC}"
echo ""
echo "Your app should now be available at https://$DOMAIN"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "View logs:     docker compose -f deploy/docker/docker-compose.prod.yml logs -f"
echo "Stop:          docker compose -f deploy/docker/docker-compose.prod.yml down"
echo "Restart:       docker compose -f deploy/docker/docker-compose.prod.yml restart"
echo "Update:        git pull && docker compose -f deploy/docker/docker-compose.prod.yml up --build -d"
