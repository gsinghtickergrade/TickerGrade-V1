# TickerGrade - Swing Trading Decision Engine

A comprehensive swing trading analysis dashboard optimized for 30-90 day trades. Calculates a Buy/Sell confidence score (0-10) based on five key pillars.

**App Name:** TickerGrade (displayed in UI header and browser title)

## Overview

This application provides data-driven stock analysis by fetching real-time data from Financial Modeling Prep (FMP) and Federal Reserve (FRED) APIs. It calculates weighted scores across catalysts, technicals, value, macro liquidity, and event risk indicators.

## Project Architecture

### Backend (Python/Flask)
- **Location**: `/backend`
- **Port**: 8000
- **Main file**: `backend/app.py`
- **Data services**: `backend/data_services.py` (FMP/FRED API clients with 10-min caching)
- **Scoring engine**: `backend/scoring_engine.py` (5-pillar scoring logic)
- **Dependencies**: Flask, Flask-CORS, fredapi, textblob, cachetools, pandas, numpy

### Frontend (Next.js/React)
- **Location**: `/frontend`
- **Port**: 5000
- **Tech stack**: Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, Recharts

## Scoring Engine (5 Pillars)

### Pillar A: Catalysts & Sentiment (20% weight)
- **Analyst Activity**: Uses `/stable/grades` endpoint to fetch grades from last 30 days
  - Compares `newGrade` vs `previousGrade` to determine upgrades/downgrades
  - Grade ranking: Strong Sell < Sell < Hold < Buy < Strong Buy
- **News Sentiment**: Uses `/stable/fmp-articles` endpoint for raw news
  - TextBlob analyzes sentiment polarity on article titles only
  - Averages sentiment scores across up to 10 articles

### Pillar B: Technical Structure (35% weight) - Advanced Divergence
- **RSI Strategy (Divergence Focus)**:
  - Calculate RSI (14) using scipy.signal for peak/trough detection
  - **Bullish Divergence**: Price made Lower Low + RSI made Higher Low = High Bullish Score (+3.0)
  - **Bearish Divergence**: Price made Higher High + RSI made Lower High = High Bearish Score (-3.0)
  - **Fallback**: If no divergence, use standard RSI (40-50 Neutral-Bullish, >75 Overextended)
- **MACD (12,26,9)**:
  - Golden Cross (MACD crosses above Signal) = +2.5
  - Death Cross (MACD crosses below Signal) = -2.0
  - Above Signal = +1.5, Below Signal = -1.0
- **Volume Trend**:
  - Bullish if Current Volume > 20-Day SMA AND Price is Green (close > open)
  - Heavy Selling if Volume > SMA but Red day
- **Support Levels**: Lowest Low of last 20 days as "Stop Loss Support"

### Pillar C: Relative Value (15% weight)
- **Data Source**: `/stable/key-metrics-ttm` and `/stable/ratios-ttm` endpoints
- **Primary Metric: PEG Ratio** (`pegRatioTTM`)
  - PEG < 1.0: Bullish (Undervalued Growth)
  - PEG 1.0-2.0: Neutral
  - PEG > 2.0: Bearish (Overvalued)
- **Fallback: P/S Ratio** (if PEG unavailable)
  - Uses `priceToSalesRatioTTM` when PEG is N/A
  - P/S < 3.0: Bullish (Cheap Revenue)
  - P/S > 10.0: Bearish (Expensive)
  - UI displays "Using P/S (PEG N/A)" label when fallback is used
- **Analyst Price Targets**: Upside percentage from consensus target

### Pillar D: Macro Liquidity (20% weight)
- Fed Net Liquidity = WALCL - WTREGEN - RRPONTSYD
- Credit Spreads (BAMLH0A0HYM2) - > 4.0% or rising = bearish

### Pillar E: Event Risk (10% weight) - Dual-Layer Safety Check
- **Calendar Risk (FMP)**: Earnings blackout rule - If next earnings within 15 days, force "WAIT" recommendation
- **Smart Money Fear Gauge (Yahoo Finance)**:
  - Fetches Put/Call Ratio from options market using yfinance
  - Target expiration: Closest to 30 days from today
  - PCR > 2.0: High Bearish Hedging → Penalize score by -2.0 points, Status = "Warning"
  - PCR < 0.5: Excessive Call Buying → Status = "Greed" (neutral score)
  - PCR 0.5-2.0: Normal range
  - Safety fallback: If yfinance fails, defaults PCR to 0.7

## API Endpoints

- `GET /api/analyze/<ticker>` - Analyze stock (requires auth)
- `GET /api/macro/net-liquidity` - Get Fed liquidity data (requires auth)
- `GET /api/auth/status` - Check authentication status
- `GET /api/health` - Health check

## Running the Application

Both workflows are configured:
1. **Backend API**: Runs Flask server on port 8000
2. **Frontend**: Runs Next.js dev server on port 5000

## Environment Variables (Secrets)

- `FMP_API_KEY` - Financial Modeling Prep API key
- `FRED_API_KEY` - Federal Reserve FRED API key
- `SESSION_SECRET` - Session encryption key

## Data Sources

- **Company & Calendar Data**: Financial Modeling Prep (FMP) Stable API
- **Macro Economics**: Federal Reserve Bank of St. Louis (FRED) API
- **Options Sentiment**: Yahoo Finance via yfinance library

## Access Control

The application uses an **Anonymous Clickwrap Modal** for terms acceptance:
- **No Login Required**: Users can access the tool without creating an account
- **Terms Acceptance**: Modal blocks access until user clicks "I Understand & Agree"
- **LocalStorage**: Stores `terms_accepted = true` in browser localStorage
- **Privacy**: No user data is collected or stored on the server
- **Persistence**: Terms acceptance persists until user clears browser cache

## Legal Compliance

- **Welcome Modal**: Disclaimer shown on first visit
- **Cookie Banner**: Dismissible consent banner
- **Legal Page**: `/legal` with Privacy, Terms, Disclaimer tabs
- **Data Attribution**: ICE Data Indices for OAS, FRED API disclaimer

## Verdict Scale

- 8.0-10.0: **Strong Buy** (Sniper Entry)
- 6.0-7.9: **Watchlist** (Setup Developing)
- <6.0: **Pass / Hold**

## Recent Changes

- 2025-12-30: Smart Money Fear Gauge (Put/Call Ratio)
  - Added yfinance integration for options data
  - Pillar E now includes dual-layer check: Calendar Risk + Put/Call Ratio
  - PCR > 2.0 triggers "Warning" with -2.0 score penalty
  - Updated About section with new Pillar 5 description and data sources

- 2025-12-29: Multi-panel technical indicator chart
  - Added RSI, MACD, and Volume time series to price_history API response
  - Enhanced PriceChart component with 4 panels: Price, RSI (14), MACD (12,26,9), Volume
  - RSI panel shows overbought (70) and oversold (30) reference lines
  - MACD panel displays histogram bars (green/red) with MACD and Signal lines
  - Volume panel shows colored bars (green=up day, red=down day) with 20-day SMA
  - MACD uses standard absolute dollar calculation (not PPO)
  - RSI uses Wilder's smoothing (EMA with alpha=1/14)

- 2025-12-28: Complete rebuild to Swing Trading Decision Engine
  - New 5-pillar scoring system (Catalysts, Technicals, Value, Macro, Event Risk)
  - Integrated FMP API for stock data, analyst ratings, price targets
  - Integrated FRED API for Fed liquidity and credit spread data
  - Added 10-minute server-side caching for all API calls
  - New Action Card with Entry Zone, Stop Loss, Target, Risk/Reward
  - Fed Net Liquidity vs S&P 500 chart visualization
  - Welcome disclaimer modal and cookie consent banner
  - Legal pages (Privacy, Terms, Disclaimer)
  - Share button with Web Share API support

- 2025-12-27: Added Replit Auth with email whitelist

## User Preferences

- Clean, professional financial dashboard look
- Color-coded gauge (Red=Sell, Green=Buy)
- Display sub-scores for each pillar
- Legal compliance for educational tool
