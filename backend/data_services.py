import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from cachetools import TTLCache
from fredapi import Fred
import yfinance as yf
import logging
from services import finnhub_service

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
    """Get stock quote using yfinance."""
    key = f"quote_{ticker}"
    def fetch():
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            if info:
                return {
                    'price': info.get('currentPrice') or info.get('regularMarketPrice'),
                    'change': info.get('regularMarketChange'),
                    'changesPercentage': info.get('regularMarketChangePercent'),
                    'name': info.get('shortName') or info.get('longName'),
                    'symbol': ticker
                }
        except Exception as e:
            logger.error(f"Error fetching quote for {ticker}: {e}")
        return None
    return get_cached(key, fetch)

def get_stock_profile(ticker):
    """Get stock profile using yfinance."""
    key = f"profile_{ticker}"
    def fetch():
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            if info:
                return {
                    'companyName': info.get('shortName') or info.get('longName'),
                    'sector': info.get('sector'),
                    'industry': info.get('industry'),
                    'description': info.get('longBusinessSummary'),
                    'website': info.get('website'),
                    'symbol': ticker
                }
        except Exception as e:
            logger.error(f"Error fetching profile for {ticker}: {e}")
        return None
    return get_cached(key, fetch)

def get_historical_prices(ticker, days=120):
    """Get historical prices using yfinance."""
    key = f"historical_{ticker}_{days}"
    def fetch():
        try:
            stock = yf.Ticker(ticker)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            df = stock.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
            if df is not None and len(df) > 0:
                df = df.reset_index()
                df.columns = [c.lower().replace(' ', '_') for c in df.columns]
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'])
                return df
        except Exception as e:
            logger.error(f"Error fetching historical prices for {ticker}: {e}")
        return None
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
    """Get earnings calendar from Finnhub with yfinance fallback."""
    key = f"earnings_{ticker}"
    def fetch():
        now = datetime.now()
        
        finnhub_earnings = finnhub_service.get_earnings_calendar(ticker)
        if finnhub_earnings and len(finnhub_earnings) > 0:
            logger.info(f"Finnhub earnings for {ticker}: {finnhub_earnings}")
            return finnhub_earnings
        
        try:
            stock = yf.Ticker(ticker)
            calendar = stock.calendar
            if calendar is not None:
                earnings_date = None
                if isinstance(calendar, dict) and 'Earnings Date' in calendar:
                    earnings_date = calendar['Earnings Date']
                    if isinstance(earnings_date, list) and len(earnings_date) > 0:
                        earnings_date = earnings_date[0]
                elif hasattr(calendar, 'index') and 'Earnings Date' in calendar.index:
                    earnings_date = calendar.loc['Earnings Date']
                    if hasattr(earnings_date, 'iloc'):
                        earnings_date = earnings_date.iloc[0]
                
                if earnings_date is not None:
                    if hasattr(earnings_date, 'strftime'):
                        date_str = earnings_date.strftime('%Y-%m-%d')
                    else:
                        date_str = str(earnings_date)[:10]
                    
                    parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
                    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
                    days_diff = (today - parsed_date).days
                    
                    if days_diff <= 5:
                        logger.info(f"yfinance earnings for {ticker}: {date_str} (days_diff={days_diff})")
                        return [{'date': date_str, 'symbol': ticker, 'source': 'yfinance'}]
                    else:
                        logger.warning(f"yfinance earnings date for {ticker} is too old: {date_str} ({days_diff} days ago)")
        except Exception as e:
            logger.warning(f"yfinance earnings lookup failed for {ticker}: {e}")
        
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
    """Get SPY historical data using yfinance."""
    key = "spy_data"
    def fetch():
        try:
            spy = yf.Ticker('SPY')
            end_date = datetime.now()
            start_date = end_date - timedelta(days=180)
            df = spy.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
            if df is not None and len(df) > 0:
                df = df.reset_index()
                df.columns = [c.lower().replace(' ', '_') for c in df.columns]
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'])
                    df.set_index('date', inplace=True)
                return df
        except Exception as e:
            logger.error(f"Error fetching SPY data: {e}")
        return None
    return get_cached(key, fetch)

def get_put_call_ratio(ticker):
    """
    Calculate Put/Call Ratio from options data using Yahoo Finance.
    Returns the PCR for the expiration date closest to 30 days out.
    """
    key = f"pcr_{ticker}"
    def fetch():
        try:
            stock = yf.Ticker(ticker)
            expirations = stock.options
            
            if not expirations:
                logger.warning(f"No options data available for {ticker}")
                return 0.7
            
            target_date = datetime.now() + timedelta(days=30)
            closest_exp = min(expirations, key=lambda x: abs(datetime.strptime(x, '%Y-%m-%d') - target_date))
            
            chain = stock.option_chain(closest_exp)
            
            calls_volume = chain.calls['volume'].sum() if 'volume' in chain.calls.columns else 0
            puts_volume = chain.puts['volume'].sum() if 'volume' in chain.puts.columns else 0
            
            if pd.isna(calls_volume):
                calls_volume = 0
            if pd.isna(puts_volume):
                puts_volume = 0
            
            if calls_volume == 0:
                logger.warning(f"No call volume for {ticker}, defaulting PCR to 0.7")
                return 0.7
            
            pcr = puts_volume / calls_volume
            logger.info(f"Yahoo Finance PCR for {ticker}: {pcr:.2f} (Puts: {puts_volume}, Calls: {calls_volume}, Exp: {closest_exp})")
            return round(pcr, 2)
            
        except Exception as e:
            logger.error(f"Error fetching options data for {ticker}: {e}")
            return 0.7
    
    return get_cached(key, fetch)
