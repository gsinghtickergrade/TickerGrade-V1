# TickerGrade - Swing Trading Decision Engine

A comprehensive swing trading analysis dashboard optimized for **30-60 day "Inter-Quarter" trades**. Calculates a Buy/Sell confidence score (0-10) based on five key pillars.

**App Name:** TickerGrade (displayed in UI header and browser title)

## Overview

This application provides data-driven stock analysis by fetching real-time data from MarketData.app, Finnhub, and Federal Reserve (FRED) APIs. It calculates weighted scores across catalysts, technicals, value, macro liquidity, and event risk indicators.

## Project Architecture

### Backend (Python/Flask)
- **Location**: `/backend`
- **Port**: 8000
- **Main file**: `backend/app.py`
- **Data services**: `backend/data_services.py` (Finnhub/FRED API clients with 10-min caching)
- **Finnhub service**: `backend/services/finnhub_service.py` (Finnhub API wrapper with stock_candles for historical data)
- **Scoring engine**: `backend/scoring_engine.py` (5-pillar scoring logic)
- **Dependencies**: Flask, Flask-CORS, fredapi, finnhub-python, textblob, cachetools, pandas, numpy, scipy

### Frontend (Next.js/React)
- **Location**: `/frontend`
- **Port**: 5000
- **Tech stack**: Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, Recharts

## Scoring Engine (5 Pillars)

### Pillar A: Catalysts & Sentiment (20% weight)
- **Analyst Activity**: Uses Finnhub `upgrade_downgrade` endpoint to fetch grades from last 6 months
  - Compares `from_grade` vs `to_grade` to determine upgrades/downgrades
  - Grade ranking: Strong Sell < Sell < Hold < Buy < Strong Buy
- **News Sentiment**: Uses Finnhub `company_news` endpoint for raw news
  - TextBlob analyzes sentiment polarity on article headlines only
  - Averages sentiment scores across up to 20 articles

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
- **Data Source**: Finnhub `company_basic_financials` endpoint
- **Primary Metric: PEG Ratio** (`pegRatio`)
  - PEG < 1.0: Bullish (Undervalued Growth)
  - PEG 1.0-2.0: Neutral
  - PEG > 2.0: Bearish (Overvalued)
- **Fallback: P/S Ratio** (if PEG unavailable)
  - Uses `psTTM` when PEG is N/A
  - P/S < 3.0: Bullish (Undervalued)
  - P/S > 10.0: Bearish (Expensive)
  - UI displays "Using P/S (PEG N/A)" label when fallback is used
- **Analyst Price Targets**: From Finnhub `price_target` endpoint

### Pillar D: Macro Liquidity (20% weight)
- Fed Net Liquidity = WALCL - WTREGEN - RRPONTSYD
- Credit Spreads (BAMLH0A0HYM2) - > 4.0% or rising = bearish

### Pillar E: Event Risk (10% weight) - Earnings Calendar Check
- **Calendar Risk (Finnhub)**: Earnings blackout rule
  - Pre-earnings: 1-15 calendar days before earnings = Blackout
  - Earnings day: 0 days = Blackout
  - Post-earnings: 1-5 calendar days after earnings (3 working days proxy) = Blackout

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

- `MARKETDATA_API_KEY` - MarketData.app API key for real-time prices
- `FINNHUB_API_KEY` - Finnhub API key for company data, analyst ratings, earnings
- `FRED_API_KEY` - Federal Reserve FRED API key
- `SESSION_SECRET` - Session encryption key

## Data Sources

- **Real-Time Prices**: MarketData.app API
- **Company Data & Analyst Ratings**: Finnhub API
- **Historical Prices**: Finnhub `stock_candles` endpoint (daily OHLCV)
- **Macro Economics**: Federal Reserve Bank of St. Louis (FRED) API

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

- 8.5-10.0: **Strong Bullish**
- 6.5-8.4: **Bullish**
- 5.0-6.4: **Neutral**
- 0.0-4.9: **Bearish**

## Site Structure (Multi-Page)

The application uses Next.js App Router for file-based routing:
- **Dashboard** (`/`) - Main stock scanner with "Why TickerGrade?" philosophy section
- **About Dropdown** (in navbar) - Contains:
  - **Our Story** (`/our-story`) - Project background and "Glass Box" philosophy
  - **Legal & Compliance** (`/legal`) - Privacy, Terms, Disclaimer tabs with LLC disclaimer
  - **Contact** (`/contact`) - Feedback instructions and support email
- **Methodology** (`/methodology`) - Detailed 5-pillar scoring explanations
- **User Guide** (`/guide`) - Score interpretation cheat sheet and safety features
- **Trade Ideas** (`/trade-ideas`) - Curated analyst watchlist with signal cards
- **Feedback** (`/feedback`) - Beta tester feedback form (database-backed)
- **Admin** (`/admin`) - Password-protected admin panel for managing trade ideas

Global components in layout.tsx:
- **Navbar** - Fixed header with dropdown menu for About section (mobile responsive)
- **Footer** - Simplified data attribution (MarketData, Finnhub, FRED) and copyright

## Recent Changes

- 2026-01-14: Remove yfinance Dependency (Legal Compliance)
  - Replaced all yfinance historical data calls with Finnhub `stock_candles` endpoint
  - Added `get_stock_candles()` function to finnhub_service.py returning DataFrame format
  - Replaced SPY benchmark data source with Finnhub stock_candles
  - Removed Put/Call Ratio feature (no legal options data source available)
  - Removed PCR logic from scoring_engine.py and app.py
  - Removed PCR UI card from PillarCard.tsx
  - Updated methodology page, guide page, and replit.md to reflect changes
  - Removed yfinance from pyproject.toml dependencies

- 2026-01-14: Navigation Refactor & Footer Cleanup
  - Converted "About" link to dropdown menu with 3 items: Our Story, Legal & Compliance, Contact
  - Created `/our-story` page (migrated from `/about`)
  - Created `/contact` page with feedback instructions and support email
  - Updated `/legal` page title to "Legal & Compliance" with bold LLC disclaimer at top
  - Removed legal links from Footer (now in About dropdown)
  - Updated Footer data attribution: "MarketData, Finnhub, and FRED"
  - Updated WelcomeModal data attribution to match

- 2026-01-14: Earnings Blackout & Liquidity Chart Fixes
  - Fixed earnings calendar to include past dates (within 5 days) for post-earnings blackout
  - Fixed liquidity chart timezone mismatch between FRED and SPY data

- 2026-01-10: Admin-Curated Scanner Workflow
  - Added Watchlist model for tracking tickers to scan
  - Added ScanStaging model for holding scanner results before publishing
  - Created `backend/services/scanner.py` for automated watchlist analysis
  - Scanner identifies Bullish (score ≥8) and Bearish (score ≤5) candidates
  - Admin panel updated with Scanner Watchlist management section
  - Admin panel updated with Scanner Staging section for review/publish workflow
  - Publish modal requires admin commentary before moving to trade ideas
  - Trade ideas page now displays admin comments and scores
  - Direction mapping: Strong Bullish (≥8.5), Bullish (≥6.5), Neutral (≥5.0), Bearish (<5.0)

- 2026-01-08: MarketData Real-Time Pricing Integration
  - Added `backend/services/marketdata_service.py` for real-time stock prices
  - Primary price source: MarketData.app API (real-time)
  - Fallback: FMP delayed quotes if MarketData unavailable
  - API response includes `price_source` field
  - Updated footer and methodology page data sources to include MarketData

- 2026-01-05: Trade Setup Card Compliance Update
  - Renamed "Trade Setup" to "Hypothetical Risk/Reward"
  - Changed "Stop Loss" to "Support / Invalidation Level"
  - Changed "Target (60-Day)" to "Resistance / Target Zone"
  - Added educational disclaimer at bottom of card
  - Updated User Guide page with consistent terminology

- 2026-01-05: Trade Ideas Feature
  - Added TradeIdea model (ticker, direction, thesis, timestamp, active)
  - Created `/trade-ideas` public page with color-coded signal cards
  - Created `/admin` password-protected panel for CRUD operations
  - Direction badges match scoreboard colors (Strong Bullish=Green, Bullish=Blue, Neutral=Yellow, Bearish=Red)
  - Added disclaimer footer about educational purposes

- 2026-01-05: UI Cleanup & Scoreboard Update
  - Updated score thresholds: 8.5+ Strong Bullish, 6.5+ Bullish, 5.0+ Neutral, <5.0 Bearish
  - Removed score signal and share button from dashboard
  - ScoreGauge now shows "Wait (Earnings)" during blackout periods
  - Feedback page now uses database instead of mailto link

- 2026-01-01: Multi-Page Navigation Refactor
  - Converted single-page app to multi-page structure using Next.js App Router
  - Created fixed Navbar component with Dashboard, Methodology, User Guide, and Feedback links
  - Created `/methodology` page with detailed pillar descriptions
  - Created `/guide` page with score interpretation cheat sheet
  - Added "Why TickerGrade?" philosophy section to Dashboard
  - Moved Footer to global layout component
  - All pages use pt-24 padding to accommodate fixed navbar

- 2026-01-01: Inter-Quarter Timeframe Realignment (30-60 Days)
  - Updated hero subtitle and About section to focus on "Inter-Quarter" sweet spot
  - Refactored Trade Setup to use ATR-based volatility brackets:
    - Stop Loss = Entry - max(2.5 × ATR, 4% floor) for breathing room
    - 4% sanity floor prevents whipsaw on low-volatility stocks (e.g., KO)
    - Target = Entry + (5.0 × ATR), capped at analyst target if lower
  - Renamed "Target" label to "Target (60-Day)" in Trade Setup card

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
