import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from cachetools import TTLCache
from fredapi import Fred
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

FMP_API_KEY = os.environ.get('FMP_API_KEY')
FRED_API_KEY = os.environ.get('FRED_API_KEY')

FMP_BASE_URL = 'https://financialmodelingprep.com/stable'

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

def fmp_get(endpoint, params=None):
    if params is None:
        params = {}
    params['apikey'] = FMP_API_KEY
    url = f"{FMP_BASE_URL}/{endpoint}"
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"FMP API error for {endpoint}: {e}")
        return None

def get_stock_quote(ticker):
    key = f"quote_{ticker}"
    def fetch():
        data = fmp_get("quote", {'symbol': ticker})
        return data[0] if data and len(data) > 0 else None
    return get_cached(key, fetch)

def get_stock_profile(ticker):
    key = f"profile_{ticker}"
    def fetch():
        data = fmp_get("profile", {'symbol': ticker})
        return data[0] if data and len(data) > 0 else None
    return get_cached(key, fetch)

def get_historical_prices(ticker, days=120):
    key = f"historical_{ticker}_{days}"
    def fetch():
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        data = fmp_get("historical-price-eod/full", {
            'symbol': ticker,
            'from': start_date.strftime('%Y-%m-%d'),
            'to': end_date.strftime('%Y-%m-%d')
        })
        if data and isinstance(data, list) and len(data) > 0:
            df = pd.DataFrame(data)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date').reset_index(drop=True)
            return df
        return None
    return get_cached(key, fetch)

def get_analyst_ratings(ticker):
    key = f"analyst_{ticker}"
    def fetch():
        data = fmp_get("grades", {'symbol': ticker})
        if data:
            thirty_days_ago = datetime.now() - timedelta(days=30)
            recent = []
            for r in data:
                try:
                    grade_date = datetime.strptime(r.get('date', '')[:10], '%Y-%m-%d')
                    if grade_date >= thirty_days_ago:
                        recent.append(r)
                except:
                    continue
            return recent[:30]
        return []
    return get_cached(key, fetch)

def get_stock_news_sentiment(ticker):
    key = f"news_{ticker}"
    def fetch():
        data = fmp_get("fmp-articles", {'limit': 30})
        if data:
            ticker_upper = ticker.upper()
            filtered = [
                article for article in data 
                if ticker_upper in (article.get('tickers') or '')
            ]
            return filtered[:20] if filtered else data[:10]
        return []
    return get_cached(key, fetch)

def get_analyst_price_targets(ticker):
    key = f"targets_{ticker}"
    def fetch():
        data = fmp_get("price-target-summary", {'symbol': ticker})
        if data and len(data) > 0:
            summary = data[0]
            return {
                'targetConsensus': summary.get('lastQuarterAvgPriceTarget', 0),
                'targetHigh': summary.get('lastMonthAvgPriceTarget', 0),
                'targetLow': summary.get('lastYearAvgPriceTarget', 0),
                'numberOfAnalysts': summary.get('lastQuarterCount', 0)
            }
        return None
    return get_cached(key, fetch)

def get_key_metrics(ticker):
    key = f"metrics_{ticker}"
    def fetch():
        data = fmp_get("ratios-ttm", {'symbol': ticker})
        if data and len(data) > 0:
            ratios = data[0]
            metrics = fmp_get("key-metrics-ttm", {'symbol': ticker})
            if metrics and len(metrics) > 0:
                ratios.update(metrics[0])
            return ratios
        return None
    return get_cached(key, fetch)

def get_earnings_calendar(ticker):
    key = f"earnings_{ticker}"
    def fetch():
        data = fmp_get("earnings-calendar", {'symbol': ticker})
        if data:
            now = datetime.now()
            future = []
            for e in data:
                try:
                    edate = datetime.strptime(e.get('date', '1900-01-01'), '%Y-%m-%d')
                    if edate > now:
                        future.append(e)
                except:
                    continue
            return sorted(future, key=lambda x: x.get('date', ''))[:1]
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
    key = "spy_data"
    def fetch():
        end_date = datetime.now()
        start_date = end_date - timedelta(days=180)
        data = fmp_get("historical-price-eod/full", {
            'symbol': 'SPY',
            'from': start_date.strftime('%Y-%m-%d'),
            'to': end_date.strftime('%Y-%m-%d')
        })
        if data and isinstance(data, list) and len(data) > 0:
            df = pd.DataFrame(data)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date').reset_index(drop=True)
            df.set_index('date', inplace=True)
            return df
        return None
    return get_cached(key, fetch)
