#!/bin/bash
# Azure Container Apps Deployment Script (with FREE external database)
# Uses Neon/Supabase for PostgreSQL to save ~$13/month

set -e

# Configuration - Update these values
RESOURCE_GROUP="sadaqa-rg"
LOCATION="eastus"
CONTAINER_REGISTRY="sadaqaregistry"
CONTAINER_APP_ENV="sadaqa-env"
CONTAINER_APP_NAME="sadaqa-api"
IMAGE_NAME="sadaqa-server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Community-Sadaqa Azure Deployment (Free DB Edition)${NC}"
echo "========================================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set!${NC}"
    echo ""
    echo "Please get a FREE PostgreSQL database from one of these providers:"
    echo "  1. Neon (recommended): https://neon.tech"
    echo "  2. Supabase: https://supabase.com"
    echo "  3. Railway: https://railway.app"
    echo ""
    echo "Then run this script with:"
    echo "  DATABASE_URL='postgresql://...' ./deploy/azure-container-apps-free.sh"
    echo ""
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not installed. Install from: https://docs.microsoft.com/cli/azure/install-azure-cli${NC}"
    exit 1
fi

# Check if logged in
echo -e "${YELLOW}📋 Checking Azure login...${NC}"
az account show &> /dev/null || az login

# Get subscription info
SUBSCRIPTION=$(az account show --query name -o tsv)
echo -e "${GREEN}✓ Using subscription: $SUBSCRIPTION${NC}"

# Step 1: Create Resource Group (if not exists)
echo -e "\n${YELLOW}Step 1: Creating Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION --output none 2>/dev/null || true
echo -e "${GREEN}✓ Resource group '$RESOURCE_GROUP' ready${NC}"

# Step 2: Create Azure Container Registry
echo -e "\n${YELLOW}Step 2: Creating Container Registry...${NC}"
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_REGISTRY \
    --sku Basic \
    --admin-enabled true \
    --output none 2>/dev/null || echo "Registry already exists"
echo -e "${GREEN}✓ Container Registry '$CONTAINER_REGISTRY' ready${NC}"

# Step 3: Build and push image to ACR
echo -e "\n${YELLOW}Step 3: Building and pushing Docker image...${NC}"
az acr build \
    --registry $CONTAINER_REGISTRY \
    --image $IMAGE_NAME:latest \
    --file Dockerfile \
    .
echo -e "${GREEN}✓ Image pushed to ACR${NC}"

# Step 4: Create Container Apps Environment
echo -e "\n${YELLOW}Step 4: Creating Container Apps Environment...${NC}"
az containerapp env create \
    --name $CONTAINER_APP_ENV \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --output none 2>/dev/null || echo "Environment already exists"
echo -e "${GREEN}✓ Container Apps environment ready${NC}"

# Step 5: Get ACR credentials
echo -e "\n${YELLOW}Step 5: Getting ACR credentials...${NC}"
ACR_LOGIN_SERVER=$(az acr show --name $CONTAINER_REGISTRY --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name $CONTAINER_REGISTRY --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $CONTAINER_REGISTRY --query "passwords[0].value" -o tsv)

# Step 6: Create/Update Container App
echo -e "\n${YELLOW}Step 6: Deploying Container App...${NC}"
az containerapp create \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_APP_ENV \
    --image "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:latest" \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password "$ACR_PASSWORD" \
    --target-port 5000 \
    --ingress external \
    --cpu 0.25 \
    --memory 0.5Gi \
    --min-replicas 0 \
    --max-replicas 3 \
    --env-vars "DATABASE_URL=$DATABASE_URL" "NODE_ENV=production" "PORT=5000" \
    --output none 2>/dev/null || \
az containerapp update \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --image "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:latest" \
    --set-env-vars "DATABASE_URL=$DATABASE_URL" "NODE_ENV=production" "PORT=5000" \
    --output none

echo -e "${GREEN}✓ Container App deployed${NC}"

# Step 7: Get the app URL
APP_URL=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

echo -e "\n${GREEN}========================================================"
echo -e "🎉 DEPLOYMENT COMPLETE!"
echo -e "========================================================${NC}"
echo ""
echo -e "Your app is available at: ${YELLOW}https://${APP_URL}${NC}"
echo ""
echo -e "${YELLOW}💰 Monthly Cost Estimate:${NC}"
echo "  Container Apps: ~\$0-10 (scales to zero!)"
echo "  Container Registry: ~\$5"
echo "  Database (Neon/Supabase): FREE"
echo "  Total: ~\$5-15/month"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the API: curl https://${APP_URL}/api/posts"
echo "2. Update your Expo app to use this API URL"
echo "3. (Optional) Add custom domain in Azure Portal"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "View logs:     az containerapp logs show -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP --follow"
echo "Scale up:      az containerapp update -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP --min-replicas 1"
echo "Delete all:    az group delete -n $RESOURCE_GROUP --yes"
