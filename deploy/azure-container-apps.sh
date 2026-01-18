#!/bin/bash
# Azure Container Apps Deployment Script
# This is the EASIEST way to deploy to Azure with automatic HTTPS

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

echo -e "${GREEN}🚀 Community-Sadaqa Azure Deployment${NC}"
echo "================================================"

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

# Step 1: Create Resource Group
echo -e "\n${YELLOW}Step 1: Creating Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
echo -e "${GREEN}✓ Resource group '$RESOURCE_GROUP' created${NC}"

# Step 2: Create Azure Container Registry
echo -e "\n${YELLOW}Step 2: Creating Container Registry...${NC}"
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_REGISTRY \
    --sku Basic \
    --admin-enabled true \
    --output none
echo -e "${GREEN}✓ Container Registry '$CONTAINER_REGISTRY' created${NC}"

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
    --output none
echo -e "${GREEN}✓ Container Apps environment created${NC}"

# Step 5: Get ACR credentials
echo -e "\n${YELLOW}Step 5: Getting ACR credentials...${NC}"
ACR_LOGIN_SERVER=$(az acr show --name $CONTAINER_REGISTRY --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name $CONTAINER_REGISTRY --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $CONTAINER_REGISTRY --query "passwords[0].value" -o tsv)

# Step 6: Create PostgreSQL Flexible Server
echo -e "\n${YELLOW}Step 6: Creating PostgreSQL database...${NC}"
DB_SERVER_NAME="sadaqa-db-$(openssl rand -hex 4)"
DB_ADMIN_USER="sadaqaadmin"
DB_ADMIN_PASSWORD="$(openssl rand -base64 24)"
DB_NAME="sadaqa"

az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_SERVER_NAME \
    --location $LOCATION \
    --admin-user $DB_ADMIN_USER \
    --admin-password "$DB_ADMIN_PASSWORD" \
    --tier Burstable \
    --sku-name Standard_B1ms \
    --storage-size 32 \
    --version 16 \
    --public-access 0.0.0.0-255.255.255.255 \
    --yes \
    --output none

echo -e "${GREEN}✓ PostgreSQL server created${NC}"

# Create the database
echo -e "${YELLOW}Creating database '$DB_NAME'...${NC}"
az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $DB_SERVER_NAME \
    --database-name $DB_NAME \
    --output none

echo -e "${GREEN}✓ Database created${NC}"

# Construct DATABASE_URL
DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

# Step 7: Create Container App
echo -e "\n${YELLOW}Step 7: Deploying Container App...${NC}"

# Check for Twilio credentials (optional but recommended for SMS features)
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Twilio credentials not set. SMS features will be disabled.${NC}"
    echo -e "${YELLOW}   Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PROXY_SERVICE_SID for full functionality.${NC}"
    TWILIO_ENVS=""
else
    TWILIO_ENVS="TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN"
    if [ -n "$TWILIO_PROXY_SERVICE_SID" ]; then
        TWILIO_ENVS="$TWILIO_ENVS TWILIO_PROXY_SERVICE_SID=$TWILIO_PROXY_SERVICE_SID"
    fi
fi

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
    --cpu 0.5 \
    --memory 1Gi \
    --min-replicas 0 \
    --max-replicas 3 \
    --env-vars "DATABASE_URL=$DATABASE_URL" "NODE_ENV=production" "PORT=5000" $TWILIO_ENVS \
    --output none

echo -e "${GREEN}✓ Container App deployed${NC}"

# Step 8: Get the app URL
APP_URL=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Your app is available at: ${YELLOW}https://${APP_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Important - Save these credentials:${NC}"
echo "Database Server: $DB_SERVER_NAME.postgres.database.azure.com"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_ADMIN_USER"
echo "Database Password: $DB_ADMIN_PASSWORD"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run database migrations: DATABASE_URL='$DATABASE_URL' npm run db:push"
echo "2. (Optional) Add custom domain in Azure Portal"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "View logs:     az containerapp logs show -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP"
echo "Scale app:     az containerapp update -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP --min-replicas 1"
echo "Update image:  az containerapp update -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP --image ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:latest"
