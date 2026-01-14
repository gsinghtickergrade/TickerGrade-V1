import requests
import os
import pandas as pd
from datetime import datetime, timedelta

BASE_URL = "https://api.marketdata.app/v1"

def get_headers():
    token = os.environ.get("MARKETDATA_API_KEY")
    if not token:
        print("WARNING: MarketData API Token missing.")
        return {}
    return {"Authorization": f"Bearer {token}"}

def get_historical_candles(ticker, days=120):
    """
    Fetches historical daily OHLCV candles from MarketData.app.
    Returns DataFrame with columns: date, open, high, low, close, volume
    """
    ticker = ticker.upper()
    url = f"{BASE_URL}/stocks/candles/D/{ticker}/"
    
    to_date = datetime.now().strftime('%Y-%m-%d')
    from_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    params = {
        'from': from_date,
        'to': to_date,
        'dateformat': 'unix'
    }
    
    try:
        response = requests.get(url, headers=get_headers(), params=params)
        if response.status_code in [200, 203]:
            data = response.json()
            
            if data.get('s') == 'ok' and data.get('t'):
                df = pd.DataFrame({
                    'date': pd.to_datetime(data['t'], unit='s'),
                    'open': data['o'],
                    'high': data['h'],
                    'low': data['l'],
                    'close': data['c'],
                    'volume': data['v']
                })
                df = df.sort_values('date').reset_index(drop=True)
                return df
        else:
            print(f"MarketData candles error for {ticker}: HTTP {response.status_code}")
    except Exception as e:
        print(f"MarketData Candles Error for {ticker}: {e}")
    
    return None

def get_realtime_price(ticker):
    """
    Fetches real-time price, change, and volume.
    MarketData returns parallel lists (e.g., 'last': [150.25]).
    """
    ticker = ticker.upper()
    url = f"{BASE_URL}/stocks/quotes/{ticker}/"
    
    try:
        response = requests.get(url, headers=get_headers())
        if response.status_code in [200, 203]:
            data = response.json()
            
            if data.get('s') == 'ok' and data.get('last'):
                return {
                    "price": data['last'][0],
                    "change": data['change'][0],
                    "change_percent": data['changepct'][0] * 100,
                    "volume": data['volume'][0],
                    "prev_close": data['last'][0] - data['change'][0],
                    "source": "MarketData (Real-Time)"
                }
    except Exception as e:
        print(f"MarketData Price Error for {ticker}: {e}")
    
    return None
