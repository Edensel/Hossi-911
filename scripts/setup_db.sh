#!/bin/bash

# Setup database script for Hossi-911

set -e

echo "Setting up database..."

# Load environment variables
if [ -f ../backend/.env ]; then
    export $(grep -v '^#' ../backend/.env | xargs)
fi

# Create database if it doesn't exist
psql -h localhost -U postgres -c "CREATE DATABASE IF NOT EXISTS hossi_911;" || true

# Run Alembic migrations
cd ../backend
alembic upgrade head

# Seed branches
psql -h localhost -U hospital_user -d hossi_911 -f ../database/seeds/seed_branches.sql

echo "Database setup complete!"