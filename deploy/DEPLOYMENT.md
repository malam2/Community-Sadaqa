# 🚀 Deploying Community-Sadaqa to Azure

This guide covers the **easiest** ways to deploy your app with HTTPS.

## Quick Comparison

| Method | Difficulty | Cost | Best For |
|--------|-----------|------|----------|
| **Azure Container Apps** | ⭐ Easy | $0-20/mo | Production, auto-scaling |
| Azure App Service | ⭐ Easy | $13+/mo | Simple deployments |
| Azure VM + Docker | ⭐⭐ Medium | $20+/mo | Full control |
| Azure Kubernetes (AKS) | ⭐⭐⭐ Hard | $70+/mo | Enterprise scale |

---

## Option 1: Azure Container Apps (Recommended) ✅

**The easiest production deployment with automatic HTTPS.**

### Prerequisites
1. [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) installed
2. Azure subscription (free tier works!)

### Deploy in One Command

```bash
# Make the script executable
chmod +x deploy/azure-container-apps.sh

# Run deployment
./deploy/azure-container-apps.sh
```

This script will:
- Create a Resource Group
- Set up Azure Container Registry
- Build and push your Docker image
- Create a PostgreSQL database
- Deploy your app with HTTPS
- Give you a public URL like `https://sadaqa-api.randomname.azurecontainerapps.io`

### Add Custom Domain

1. Go to [Azure Portal](https://portal.azure.com) → Container Apps → Your App
2. Click **Custom domains** → **Add custom domain**
3. Follow the DNS verification steps
4. Azure automatically provisions SSL certificate! 🔐

---

## Option 2: Quick Domain + HTTPS Setup

### Getting a Domain (Cheapest Options)

| Registrar | Typical Price | Notes |
|-----------|---------------|-------|
| [Cloudflare](https://cloudflare.com) | $8-10/yr | At-cost pricing, free DNS |
| [Namecheap](https://namecheap.com) | $9-12/yr | Good deals on .com |
| [Porkbun](https://porkbun.com) | $8-10/yr | Cheap renewals |
| [Google Domains](https://domains.google) | $12/yr | Simple interface |

**Free Subdomains for Testing:**
- `*.azurecontainerapps.io` (automatic with Container Apps)
- [FreeDNS](https://freedns.afraid.org) - Free subdomains
- [DuckDNS](https://www.duckdns.org) - Free dynamic DNS

### Getting HTTPS Certificate

**Automatic (Recommended):**
- **Azure Container Apps** - Automatic managed certificates
- **Caddy** - Automatic Let's Encrypt (included in docker-compose.prod.yml)

**Manual (Free with Let's Encrypt):**
```bash
# Using certbot
sudo certbot certonly --standalone -d yourdomain.com

# Certificates saved to /etc/letsencrypt/live/yourdomain.com/
```

---

## Option 3: Azure VM Deployment

For full control, deploy to an Azure VM.

### 1. Create VM

```bash
# Create Ubuntu VM
az vm create \
  --resource-group sadaqa-rg \
  --name sadaqa-vm \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-address-dns-name sadaqa-vm
```

### 2. Open Ports

```bash
az vm open-port --port 80 --resource-group sadaqa-rg --name sadaqa-vm
az vm open-port --port 443 --resource-group sadaqa-rg --name sadaqa-vm --priority 1001
```

### 3. SSH into VM and Deploy

```bash
# SSH in
ssh azureuser@sadaqa-vm.eastus.cloudapp.azure.com

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Clone and deploy
git clone https://github.com/yourusername/Community-Sadaqa.git
cd Community-Sadaqa

# Configure
cp deploy/env/.env.production.example deploy/env/.env.production
nano deploy/env/.env.production  # Add your credentials

# Update Caddyfile with your domain
nano deploy/docker/Caddyfile

# Deploy
./deploy/deploy-vps.sh
```

---

## Environment Variables

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |

### Database Migrations

After deploying, run migrations:

```bash
# With Azure Container Apps
DATABASE_URL="your_production_url" npm run db:push

# With Docker Compose
docker compose -f deploy/docker/docker-compose.prod.yml exec server npm run db:push
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Azure
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Login to ACR
        run: |
          az acr login --name sadaqaregistry
      
      - name: Build and push
        run: |
          az acr build --registry sadaqaregistry --image sadaqa-server:${{ github.sha }} .
      
      - name: Deploy to Container Apps
        run: |
          az containerapp update \
            --name sadaqa-api \
            --resource-group sadaqa-rg \
            --image sadaqaregistry.azurecr.io/sadaqa-server:${{ github.sha }}
```

---

## Monitoring & Logs

```bash
# View Container Apps logs
az containerapp logs show -n sadaqa-api -g sadaqa-rg --follow

# View Docker Compose logs
docker compose -f docker-compose.prod.yml logs -f

# Check app health
curl https://your-domain.com/api/posts
```

---

## Cost Estimation (Azure)

| Resource | Size | Monthly Cost |
|----------|------|--------------|
| Container Apps | 0.5 vCPU, 1GB RAM | ~$0-15 (scale to zero!) |
| PostgreSQL Flexible | B1ms | ~$13 |
| Container Registry | Basic | ~$5 |
| **Total** | | **~$18-33/month** |

**Tips to reduce costs:**
- Use scale-to-zero with Container Apps
- Use Azure PostgreSQL free tier (750 hours/month for 12 months)
- Stop dev resources when not in use

---

## Troubleshooting

### "Certificate not working"
- DNS propagation takes 5-30 minutes
- Check DNS: `nslookup yourdomain.com`

### "Database connection refused"
- Check firewall rules on PostgreSQL
- Verify DATABASE_URL has `?sslmode=require` for Azure

### "Container won't start"
```bash
# Check logs
az containerapp logs show -n sadaqa-api -g sadaqa-rg

# Check container health
docker compose -f docker-compose.prod.yml ps
```

---

## Quick Start Checklist

- [ ] Choose deployment method (Container Apps recommended)
- [ ] Run deployment script: `./deploy/azure-container-apps.sh`
- [ ] Save database credentials
- [ ] Run migrations: `npm run db:push`
- [ ] Test API: `curl https://your-app-url/api/posts`
- [ ] (Optional) Add custom domain
- [ ] Configure Expo app `EXPO_PUBLIC_DOMAIN` to point to API

🎉 **Your app is now live with HTTPS!**
