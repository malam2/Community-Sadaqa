# CI/CD & Secrets Management

## Overview

Community-Sadaqa uses GitHub Actions for continuous integration and deployment. This document covers:

1. [GitHub Workflows](#github-workflows)
2. [Secrets Management](#secrets-management)
3. [Deployment Environments](#deployment-environments)
4. [Manual Deployment](#manual-deployment)

---

## GitHub Workflows

### E2E Tests (`e2e.yml`)

Runs on every push and PR to `main`:

- Sets up PostgreSQL service container
- Installs dependencies with npm caching
- Caches Playwright browsers for faster runs
- Runs Playwright E2E tests
- Uploads test reports as artifacts

### Deploy to Azure (`deploy-azure.yml`)

Multi-stage deployment pipeline:

1. **Build**: Runs on all pushes/PRs
   - Type checking
   - Linting
   - Server build
   - Docker image build & push (skip for PRs)

2. **Deploy Staging**: Automatic on push to main
   - Deploys to `sadaqa-api-staging`
   - No manual approval required

3. **Deploy Production**: Manual trigger only
   - Requires `production` environment approval
   - Deploys to `sadaqa-api`

---

## Secrets Management

### Using the Secrets Script

We provide a helper script for managing GitHub secrets via `gh` CLI:

```bash
# List all secrets
./scripts/manage-secrets.sh list

# Set a secret (will prompt for value)
./scripts/manage-secrets.sh set DATABASE_URL

# Set a secret with value directly
./scripts/manage-secrets.sh set API_KEY "your-api-key"

# Set environment-specific secret
./scripts/manage-secrets.sh set DATABASE_URL --env production

# Delete a secret
./scripts/manage-secrets.sh delete OLD_SECRET

# Interactive setup of all required secrets
./scripts/manage-secrets.sh setup
```

### Required Secrets

| Secret | Description | Used By |
|--------|-------------|---------|
| `AZURE_CREDENTIALS` | Azure service principal JSON | `deploy-azure.yml` |
| `DATABASE_URL` | PostgreSQL connection string | Server runtime |

### Optional Secrets

| Secret | Description |
|--------|-------------|
| `EXPO_PUBLIC_DOMAIN` | API domain for client |
| `SENTRY_DSN` | Error tracking (future) |

### Creating Azure Credentials

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-sadaqa" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/sadaqa-rg \
  --sdk-auth

# Copy the JSON output and set as AZURE_CREDENTIALS secret
./scripts/manage-secrets.sh set AZURE_CREDENTIALS
```

---

## Deployment Environments

### Staging

- **URL**: `https://sadaqa-api-staging.<region>.azurecontainerapps.io`
- **Auto-deploy**: Yes, on push to `main`
- **Approval**: None required

### Production

- **URL**: `https://sadaqa-api.<region>.azurecontainerapps.io`
- **Auto-deploy**: No
- **Approval**: Required (configure in repo settings)

#### Setting Up Environment Protection

1. Go to **Settings** → **Environments**
2. Create `staging` and `production` environments
3. For `production`:
   - Enable **Required reviewers**
   - Add team members who can approve
   - Optionally set **Wait timer** (e.g., 5 minutes)

---

## Manual Deployment

### Deploy to Staging

Pushes to `main` automatically deploy to staging.

### Deploy to Production

1. Go to **Actions** → **Deploy to Azure Container Apps**
2. Click **Run workflow**
3. Select `production` from dropdown
4. Click **Run workflow**
5. Approve in the pending deployment

### Rollback

To rollback to a previous version:

```bash
# List recent images
az acr repository show-tags \
  --name sadaqaregistry \
  --repository sadaqa-server \
  --orderby time_desc \
  --output table

# Deploy specific version
az containerapp update \
  --name sadaqa-api \
  --resource-group sadaqa-rg \
  --image sadaqaregistry.azurecr.io/sadaqa-server:<TAG>
```

---

## Local Development

### Environment Variables

Create a `.env` file (never commit this):

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/local_ummah
EXPO_PUBLIC_DOMAIN=localhost:3001
NODE_ENV=development
```

### Running Locally

```bash
# Start database
docker-compose up -d postgres

# Push schema
npm run db:push

# Start server
npm run server:dev

# Start Expo (separate terminal)
npm run expo:dev
```
