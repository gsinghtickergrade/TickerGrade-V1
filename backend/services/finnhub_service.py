import os
import finnhub
from datetime import datetime, timedelta
from cachetools import TTLCache
import logging

logger = logging.getLogger(__name__)

FINNHUB_API_KEY = os.environ.get('FINNHUB_API_KEY')

finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)

cache = TTLCache(maxsize=100, ttl=600)

def get_cached(key, fetch_func):
    if key in cache:
        logger.debug(f"Cache hit for {key}")
        return cache[key]
    logger.debug(f"Cache miss for {key}, fetching...")
    try:
        data = fetch_func()
        if data is not None:
            cache[key] = data
        return data
    except Exception as e:
        logger.error(f"Error fetching {key}: {e}")
        return None

def get_basic_financials(ticker):
    """
    Get basic financials from Finnhub.
    Returns PE, PEG, P/B ratios from the 'metric' field.
    """
    key = f"finnhub_financials_{ticker}"
    
    def fetch():
        data = finnhub_client.company_basic_financials(ticker, 'all')
        if data and 'metric' in data:
            metric = data['metric']
            return {
                'pe_ratio': metric.get('peBasicExclExtraTTM') or metric.get('peTTM'),
                'peg_ratio': metric.get('pegTTM'),
                'pb_ratio': metric.get('pbQuarterly') or metric.get('pbAnnual'),
                'ps_ratio': metric.get('psTTM'),
                'dividend_yield': metric.get('dividendYieldIndicatedAnnual'),
                'beta': metric.get('beta'),
                'eps_ttm': metric.get('epsBasicExclExtraItemsTTM'),
                'revenue_per_share_ttm': metric.get('revenuePerShareTTM'),
                'raw_metric': metric
            }
        return None
    
    return get_cached(key, fetch)

def get_analyst_sentiment(ticker):
    """
    Get analyst sentiment data from Finnhub.
    Returns recommendation trends, upgrades/downgrades, and price targets.
    """
    key = f"finnhub_sentiment_{ticker}"
    
    def fetch():
        result = {
            'recommendations': None,
            'upgrades_downgrades': [],
            'price_target': None
        }
        
        try:
            recs = finnhub_client.recommendation_trends(ticker)
            if recs and len(recs) > 0:
                latest = recs[0]
                result['recommendations'] = {
                    'strong_buy': latest.get('strongBuy', 0),
                    'buy': latest.get('buy', 0),
                    'hold': latest.get('hold', 0),
                    'sell': latest.get('sell', 0),
                    'strong_sell': latest.get('strongSell', 0),
                    'period': latest.get('period')
                }
        except Exception as e:
            logger.warning(f"Failed to get recommendation trends for {ticker}: {e}")
        
        try:
            six_months_ago = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
            today = datetime.now().strftime('%Y-%m-%d')
            upgrades = finnhub_client.upgrade_downgrade(symbol=ticker, _from=six_months_ago, to=today)
            if upgrades:
                result['upgrades_downgrades'] = [
                    {
                        'action': u.get('action'),
                        'from_grade': u.get('fromGrade'),
                        'to_grade': u.get('toGrade'),
                        'company': u.get('company'),
                        'date': u.get('gradeTime')
                    }
                    for u in upgrades[:30]
                ]
        except Exception as e:
            logger.warning(f"Failed to get upgrade/downgrade for {ticker}: {e}")
        
        try:
            target = finnhub_client.price_target(ticker)
            if target:
                result['price_target'] = {
                    'target_high': target.get('targetHigh'),
                    'target_low': target.get('targetLow'),
                    'target_mean': target.get('targetMean'),
                    'target_median': target.get('targetMedian'),
                    'last_updated': target.get('lastUpdated')
                }
        except Exception as e:
            logger.warning(f"Failed to get price target for {ticker}: {e}")
        
        return result
    
    return get_cached(key, fetch)

def get_company_news(ticker, days=30):
    """
    Get company news from Finnhub for sentiment analysis.
    """
    key = f"finnhub_news_{ticker}"
    
    def fetch():
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        news = finnhub_client.company_news(ticker, _from=start_date, to=end_date)
        if news:
            return [
                {
                    'headline': n.get('headline'),
                    'summary': n.get('summary'),
                    'source': n.get('source'),
                    'datetime': n.get('datetime'),
                    'url': n.get('url')
                }
                for n in news[:20]
            ]
        return []
    
    return get_cached(key, fetch)

def get_earnings_calendar(ticker):
    """
    Get earnings calendar from Finnhub.
    """
    key = f"finnhub_earnings_{ticker}"
    
    def fetch():
        now = datetime.now()
        from_date = now.strftime('%Y-%m-%d')
        to_date = (now + timedelta(days=90)).strftime('%Y-%m-%d')
        
        try:
            earnings = finnhub_client.earnings_calendar(_from=from_date, to=to_date, symbol=ticker)
            if earnings and 'earningsCalendar' in earnings:
                calendar = earnings['earningsCalendar']
                future = [e for e in calendar if e.get('date', '') >= from_date]
                if future:
                    sorted_earnings = sorted(future, key=lambda x: x.get('date', ''))
                    return [{'date': sorted_earnings[0].get('date'), 'symbol': ticker, 'source': 'finnhub'}]
        except Exception as e:
            logger.warning(f"Finnhub earnings calendar failed for {ticker}: {e}")
        
        return []
    
    return get_cached(key, fetch)
