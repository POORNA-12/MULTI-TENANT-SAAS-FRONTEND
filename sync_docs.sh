#!/bin/bash
# Sync TenantX Architectural Documentation to GitHub

# Ensure we are in the repository root
# cd c:/Users/poorn/OneDrive/Desktop/Final%20Year%20Project/MULTI-TENANT-SAAS-FRONTEND/MULTI-TENANT-SAAS-FRONTEND

echo "🚀 Staging new documentation..."
git add README.md
git add ARCHITECTURE.md

echo "📝 Committing changes..."
git commit -m "docs: Add professional architecture and system documentation for TenantX"

echo "📤 Pushing to GitHub (dev branch)..."
git push origin dev

echo "✅ Documentation sync complete!"
