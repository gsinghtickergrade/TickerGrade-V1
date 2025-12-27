# S&P 500 Stock Scorer

A comprehensive stock analysis dashboard that calculates a Buy/Sell confidence score (1-10) based on four key pillars.

## Overview

This application provides data-driven stock analysis by fetching real-time data from Yahoo Finance and calculating weighted scores across fundamentals, valuation, technicals, and macro/market health indicators.

## Project Architecture

### Backend (Python/Flask)
- **Location**: `/backend`
- **Port**: 8000
- **Main file**: `backend/app.py`
- **Dependencies**: Flask, Flask-CORS, yfinance, pandas, numpy

### Frontend (Next.js/React)
- **Location**: `/frontend`
- **Port**: 5000
- **Tech stack**: Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, Recharts

## Scoring Engine

The scoring engine calculates a weighted score (0-10) based on four pillars:

### Pillar A: Fundamentals (30% weight)
- Revenue Growth (YoY) - >10% adds points
- Profit Margins - >15% adds points

### Pillar B: Valuation (20% weight)
- P/E Ratio compared to sector averages
- Lower P/E than sector average = higher score

### Pillar C: Technicals (30% weight)
- 50-day and 200-day SMA analysis
- RSI (14-day) - <30 is oversold (buy signal)

### Pillar D: Macro/Market Health (20% weight)
- VIX (Volatility Index) - <20 is favorable
- SPY trend analysis (above 200-day SMA = positive)

## Running the Application

Both workflows are configured:
1. **Backend API**: Runs Flask server on port 8000
2. **Frontend**: Runs Next.js dev server on port 5000

## API Endpoints

- `GET /api/analyze/<ticker>` - Analyze a stock and return scores
- `GET /api/health` - Health check endpoint

## User Preferences

- Clean, professional financial dashboard look
- Color-coded gauge (Red=Sell, Green=Buy)
- Display sub-scores for each pillar

## Authentication

The application uses Replit Auth for secure authentication:
- **Whitelist**: Only `gsinghinvestor@gmail.com` can access the application
- **Protected Routes**: All `/api/analyze/*` endpoints require authentication
- **Unauthorized Access**: Returns 403 Forbidden page for non-whitelisted users

To modify the whitelist, edit `ALLOWED_EMAILS` in `backend/replit_auth.py`.

## Recent Changes

- 2025-12-27: Added Replit Auth with email whitelist
  - Implemented secure authentication using Replit OpenID Connect
  - Added email whitelist restriction (gsinghinvestor@gmail.com only)
  - Created 403 Forbidden page for unauthorized users
  - Protected stock analysis API endpoint with @require_login decorator

- 2025-12-27: Added dynamic Strategy Settings
  - Added Strategy Settings panel with 4 sliders for adjusting pillar weights
  - Real-time score recalculation when weights change
  - Warning displayed when weights don't sum to 100%
  
- 2025-12-27: Initial implementation
  - Created Flask backend with yfinance integration
  - Implemented 4-pillar scoring engine
  - Built Next.js frontend with Tailwind and Shadcn UI
  - Added score gauge, pillar cards, and price chart components
