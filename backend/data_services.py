import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from cachetools import TTLCache
from fredapi import Fred
import logging
from services import finnhub_service
from services import marketdata_service

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

FRED_API_KEY = os.environ.get('FRED_API_KEY')

cache = TTLCache(maxsize=100, ttl=600)

def get_cached(key, fetch_func):
    if key in cache:
        logger.debug(f"Cache hit for {key}")
        return cache[key]
    logger.debug(f"Cache miss for {key}, fetching...")
    data = fetch_func()
    if data is not None:
        cache[key] = data
    return data

def get_stock_quote(ticker):
    """Get stock quote using MarketData real-time price."""
    key = f"quote_{ticker}"
    def fetch():
        try:
            price_data = marketdata_service.get_realtime_price(ticker)
            profile = finnhub_service.get_company_profile(ticker)
            if price_data:
                return {
                    'price': price_data.get('price'),
                    'change': price_data.get('change'),
                    'changesPercentage': price_data.get('change_percent'),
                    'name': profile.get('companyName') if profile else ticker,
                    'symbol': ticker
                }
        except Exception as e:
            logger.error(f"Error fetching quote for {ticker}: {e}")
        return None
    return get_cached(key, fetch)

def get_stock_profile(ticker):
    """Get stock profile using Finnhub."""
    return finnhub_service.get_company_profile(ticker)

def get_historical_prices(ticker, days=120):
    """Get historical prices using MarketData.app candles."""
    key = f"historical_{ticker}_{days}"
    def fetch():
        return marketdata_service.get_historical_candles(ticker, days=days)
    return get_cached(key, fetch)

def get_analyst_ratings(ticker):
    """Get analyst ratings from Finnhub."""
    key = f"analyst_{ticker}"
    def fetch():
        sentiment = finnhub_service.get_analyst_sentiment(ticker)
        if sentiment:
            ratings = []
            for ud in sentiment.get('upgrades_downgrades', []):
                ratings.append({
                    'action': ud.get('action', '').lower(),
                    'previousGrade': ud.get('from_grade'),
                    'newGrade': ud.get('to_grade'),
                    'company': ud.get('company'),
                    'date': ud.get('date')
                })
            return ratings
        return []
    return get_cached(key, fetch)

def get_stock_news_sentiment(ticker):
    """Get stock news from Finnhub for sentiment analysis."""
    key = f"news_{ticker}"
    def fetch():
        news = finnhub_service.get_company_news(ticker, days=30)
        if news:
            return [{'title': n.get('headline'), 'source': n.get('source')} for n in news]
        return []
    return get_cached(key, fetch)

def get_analyst_price_targets(ticker):
    """Get analyst price targets from Finnhub."""
    key = f"targets_{ticker}"
    def fetch():
        sentiment = finnhub_service.get_analyst_sentiment(ticker)
        if sentiment and sentiment.get('price_target'):
            pt = sentiment['price_target']
            return {
                'targetConsensus': pt.get('target_mean') or pt.get('target_median'),
                'targetHigh': pt.get('target_high'),
                'targetLow': pt.get('target_low'),
                'targetMean': pt.get('target_mean'),
                'numberOfAnalysts': None
            }
        return None
    return get_cached(key, fetch)

def get_key_metrics(ticker):
    """Get key metrics from Finnhub."""
    key = f"metrics_{ticker}"
    def fetch():
        financials = finnhub_service.get_basic_financials(ticker)
        if financials:
            return {
                'peRatioTTM': financials.get('pe_ratio'),
                'priceToEarningsGrowthRatioTTM': financials.get('peg_ratio'),
                'priceToBookRatioTTM': financials.get('pb_ratio'),
                'priceToSalesRatioTTM': financials.get('ps_ratio'),
                'dividendYieldTTM': financials.get('dividend_yield'),
                'beta': financials.get('beta'),
                'epsTTM': financials.get('eps_ttm')
            }
        return None
    return get_cached(key, fetch)

def get_earnings_calendar(ticker):
    """Get earnings calendar from Finnhub."""
    key = f"earnings_{ticker}"
    def fetch():
        finnhub_earnings = finnhub_service.get_earnings_calendar(ticker)
        if finnhub_earnings and len(finnhub_earnings) > 0:
            logger.info(f"Finnhub earnings for {ticker}: {finnhub_earnings}")
            return finnhub_earnings
        return []
    return get_cached(key, fetch)

def get_fred_data():
    key = "fred_macro"
    def fetch():
        try:
            fred = Fred(api_key=FRED_API_KEY)
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=180)
            
            walcl = fred.get_series('WALCL', start_date, end_date)
            tga = fred.get_series('WTREGEN', start_date, end_date)
            rrp = fred.get_series('RRPONTSYD', start_date, end_date)
            credit_spreads = fred.get_series('BAMLH0A0HYM2', start_date, end_date)
            
            df = pd.DataFrame(index=pd.date_range(start_date, end_date, freq='D'))
            
            if walcl is not None and len(walcl) > 0:
                df['walcl'] = walcl.reindex(df.index, method='ffill')
            else:
                df['walcl'] = 7000000
                
            if tga is not None and len(tga) > 0:
                df['tga'] = tga.reindex(df.index, method='ffill')
            else:
                df['tga'] = 800000
                
            if rrp is not None and len(rrp) > 0:
                df['rrp'] = rrp.reindex(df.index, method='ffill')
            else:
                df['rrp'] = 500000
                
            if credit_spreads is not None and len(credit_spreads) > 0:
                df['credit_spreads'] = credit_spreads.reindex(df.index, method='ffill')
            else:
                df['credit_spreads'] = 3.5
            
            df['net_liquidity'] = df['walcl'] - df['tga'] - df['rrp']
            df = df.dropna()
            
            return df
        except Exception as e:
            logger.error(f"FRED API error: {e}")
            return None
    return get_cached(key, fetch)

def get_spy_data():
    """Get SPY historical data using MarketData.app candles."""
    key = "spy_data"
    def fetch():
        try:
            df = marketdata_service.get_historical_candles('SPY', days=180)
            if df is not None and len(df) > 0:
                df = df.set_index('date')
                return df
        except Exception as e:
            logger.error(f"Error fetching SPY data: {e}")
        return None
    return get_cached(key, fetch)
