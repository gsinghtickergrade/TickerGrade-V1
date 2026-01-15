# TickerGrade - Swing Trading Decision Engine

## Overview

TickerGrade is a comprehensive swing trading analysis dashboard optimized for 30-60 day "Inter-Quarter" trades. It calculates a Buy/Sell confidence score (0-10) based on five weighted pillars: Catalysts & Sentiment, Technical Structure, Relative Value, Macro Liquidity, and Event Risk. The application provides data-driven stock analysis by fetching real-time data from MarketData.app, Finnhub, and Federal Reserve (FRED) APIs. Its main purpose is to offer a sophisticated yet user-friendly tool for identifying potential swing trade opportunities with a clear, data-backed verdict. The project aims to be a valuable resource for traders seeking to leverage quantitative analysis for short-to-medium term market movements, presented with full transparency and legal compliance as an educational tool.

## User Preferences

- Clean, professional financial dashboard look
- Color-coded gauge (Red=Sell, Green=Buy)
- Display sub-scores for each pillar
- Legal compliance for educational tool

## System Architecture

**Backend (Python/Flask)**: The backend is built with Flask, providing API endpoints for stock analysis, macro data, and authentication status. It integrates various data services (MarketData.app, Finnhub, FRED) with 10-minute caching. A core scoring engine processes data across five pillars to generate the final confidence score.

**Frontend (Next.js/React)**: The frontend uses Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, and Recharts to deliver a responsive, multi-page user interface. It features a dashboard, detailed methodology, user guide, trade ideas, and administrative panels.

**Scoring Engine (5 Pillars)**:
- **Catalysts & Sentiment (20% weight)**: Analyzes analyst ratings (upgrades/downgrades) and news sentiment using TextBlob.
- **Technical Structure (35% weight)**: Focuses on advanced divergence using RSI, MACD crosses, and volume trends.
- **Relative Value (15% weight)**: Primarily uses PEG ratio and falls back to P/S ratio, also considers 52-week high for technical upside.
- **Macro Liquidity (20% weight)**: Incorporates Fed Net Liquidity (WALCL, WTREGEN, RRPONTSYD) and Credit Spreads (BAMLH0A0HYM2).
- **Event Risk (10% weight)**: Checks for earnings blackout periods before, during, and immediately after earnings announcements.

**UI/UX Decisions**:
- **App Name**: "TickerGrade" displayed prominently.
- **Verdict Scale**: A clear, color-coded scale (0-10) ranging from "Strong Bullish" to "Bearish".
- **Multi-Page Structure**: Uses Next.js App Router for pages like Dashboard, Methodology, User Guide, Trade Ideas, and Admin.
- **Global Components**: Fixed Navbar with dropdowns and a simplified Footer are consistent across pages.
- **Access Control**: Implements an anonymous clickwrap modal for terms acceptance, storing `terms_accepted` in localStorage without requiring user login or collecting personal data.
- **Legal Compliance**: Includes a welcome modal disclaimer, a dismissible cookie banner, and a dedicated `/legal` page covering privacy, terms, and disclaimers.

**Technical Implementations**:
- Server-side caching for API calls (10 minutes for data services, 24 hours for FRED).
- Integration of `scipy.signal` for technical indicator calculations (e.g., RSI peak/trough detection).
- Use of `textblob` for news sentiment analysis.
- Dynamic charting with Recharts for price history, RSI, MACD, and Volume.

## External Dependencies

- **MarketData.app**: Real-time stock prices, historical candles (daily OHLCV), earnings calendar, and 52-week high data.
- **Finnhub API**: Company data, analyst ratings (upgrade/downgrade), company news, basic financials (PEG, P/S ratios), and historical prices for certain fallbacks.
- **Federal Reserve Bank of St. Louis (FRED) API**: Macroeconomic data series such as Fed Net Liquidity (WALCL, WTREGEN, RRPONTSYD) and Credit Spreads (BAMLH0A0HYM2).
- **Flask**: Python web framework for the backend.
- **Next.js**: React framework for the frontend.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: UI component library.
- **Recharts**: Composable charting library for React.
- **fredapi**: Python client for FRED API.
- **finnhub-python**: Python client for Finnhub API.
- **textblob**: Python library for processing textual data (sentiment analysis).
- **cachetools**: Python library for caching.
- **pandas, numpy, scipy**: Python libraries for data manipulation and scientific computing.
- **Flask-CORS**: Flask extension for handling Cross-Origin Resource Sharing.