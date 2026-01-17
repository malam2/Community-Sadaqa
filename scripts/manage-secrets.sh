#!/bin/bash

# ============================================================
# GitHub Secrets Management Script for Community-Sadaqa
# Uses GitHub CLI (gh) to manage repository secrets
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}You need to authenticate with GitHub CLI.${NC}"
        echo "Run: gh auth login"
        exit 1
    fi
}

# Get repository name from git remote
get_repo() {
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
    if [ -z "$REPO" ]; then
        echo -e "${RED}Error: Could not determine repository.${NC}"
        echo "Make sure you're in a git repository with a GitHub remote."
        exit 1
    fi
    echo "$REPO"
}

# List all secrets
list_secrets() {
    echo -e "${BLUE}📋 Repository Secrets:${NC}"
    gh secret list
    echo ""
    echo -e "${BLUE}📋 Environment Secrets (production):${NC}"
    gh secret list --env production 2>/dev/null || echo "  No production environment or secrets"
    echo ""
    echo -e "${BLUE}📋 Environment Secrets (staging):${NC}"
    gh secret list --env staging 2>/dev/null || echo "  No staging environment or secrets"
}

# Set a secret
set_secret() {
    local name="$1"
    local value="$2"
    local env="$3"
    
    if [ -z "$name" ]; then
        echo -e "${RED}Error: Secret name is required.${NC}"
        echo "Usage: $0 set SECRET_NAME [--env environment]"
        exit 1
    fi
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}Enter value for $name (input hidden):${NC}"
        read -s value
        echo ""
    fi
    
    if [ -n "$env" ]; then
        echo "$value" | gh secret set "$name" --env "$env"
        echo -e "${GREEN}✅ Secret '$name' set for environment '$env'${NC}"
    else
        echo "$value" | gh secret set "$name"
        echo -e "${GREEN}✅ Secret '$name' set for repository${NC}"
    fi
}

# Delete a secret
delete_secret() {
    local name="$1"
    local env="$2"
    
    if [ -z "$name" ]; then
        echo -e "${RED}Error: Secret name is required.${NC}"
        exit 1
    fi
    
    if [ -n "$env" ]; then
        gh secret delete "$name" --env "$env"
        echo -e "${GREEN}✅ Secret '$name' deleted from environment '$env'${NC}"
    else
        gh secret delete "$name"
        echo -e "${GREEN}✅ Secret '$name' deleted from repository${NC}"
    fi
}

# Setup all required secrets (interactive)
setup_all() {
    echo -e "${BLUE}🔧 Setting up all required secrets for Community-Sadaqa${NC}"
    echo ""
    
    # Required secrets
    local secrets=(
        "DATABASE_URL:PostgreSQL connection string"
        "AZURE_CREDENTIALS:Azure service principal JSON"
    )
    
    # Optional secrets
    local optional_secrets=(
        "EXPO_PUBLIC_DOMAIN:API domain (e.g., api.sadaqa.app)"
        "SENTRY_DSN:Sentry error tracking DSN"
    )
    
    echo -e "${YELLOW}📌 Required Secrets:${NC}"
    for secret_info in "${secrets[@]}"; do
        IFS=':' read -r name desc <<< "$secret_info"
        echo -e "  ${BLUE}$name${NC}: $desc"
        echo -n "  Set this secret? (y/n): "
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            set_secret "$name"
        fi
    done
    
    echo ""
    echo -e "${YELLOW}📌 Optional Secrets:${NC}"
    for secret_info in "${optional_secrets[@]}"; do
        IFS=':' read -r name desc <<< "$secret_info"
        echo -e "  ${BLUE}$name${NC}: $desc"
        echo -n "  Set this secret? (y/n): "
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            set_secret "$name"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Secret setup complete!${NC}"
}

# Show help
show_help() {
    echo "GitHub Secrets Management for Community-Sadaqa"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list                    List all secrets"
    echo "  set <name> [value]      Set a secret (prompts for value if not provided)"
    echo "  delete <name>           Delete a secret"
    echo "  setup                   Interactive setup of all required secrets"
    echo "  help                    Show this help message"
    echo ""
    echo "Options:"
    echo "  --env <environment>     Target a specific environment (staging/production)"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 set DATABASE_URL"
    echo "  $0 set DATABASE_URL 'postgresql://...' --env production"
    echo "  $0 delete OLD_SECRET"
    echo "  $0 setup"
}

# Main
check_gh_cli
REPO=$(get_repo)
echo -e "${BLUE}Repository: $REPO${NC}"
echo ""

case "${1:-help}" in
    list)
        list_secrets
        ;;
    set)
        shift
        name="$1"
        value=""
        env=""
        shift || true
        while [[ $# -gt 0 ]]; do
            case "$1" in
                --env)
                    env="$2"
                    shift 2
                    ;;
                *)
                    value="$1"
                    shift
                    ;;
            esac
        done
        set_secret "$name" "$value" "$env"
        ;;
    delete)
        shift
        name="$1"
        env=""
        if [[ "$2" == "--env" ]]; then
            env="$3"
        fi
        delete_secret "$name" "$env"
        ;;
    setup)
        setup_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
