#!/bin/bash
# Always force development environment for Vite to prevent dependency stripping
export NODE_ENV=development
echo "Starting Vite dev server on 127.0.0.1:8080..."
npm run dev -- --host 127.0.0.1 --force
