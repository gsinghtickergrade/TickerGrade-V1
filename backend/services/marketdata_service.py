import requests
import os
from datetime import datetime

BASE_URL = "https://api.marketdata.app/v1"

def get_headers():
    token = os.environ.get("MARKETDATA_API_KEY")
    if not token:
        print("WARNING: MarketData API Token missing.")
        return {}
    return {"Authorization": f"Bearer {token}"}

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
                    "change_percent": data['changepct'][0],
                    "volume": data['volume'][0],
                    "prev_close": data['last'][0] - data['change'][0],
                    "source": "MarketData (Real-Time)"
                }
    except Exception as e:
        print(f"MarketData Price Error for {ticker}: {e}")
    
    return None

def get_options_snapshot(ticker):
    """
    Fetches basic options chain stats to calculate Put/Call Ratio (PCR).
    Note: This fetches the nearest expiration to save bandwidth.
    """
    ticker = ticker.upper()
    exp_url = f"{BASE_URL}/options/expirations/{ticker}/"
    
    try:
        exp_res = requests.get(exp_url, headers=get_headers())
        if exp_res.status_code == 200:
            exp_data = exp_res.json()
            if not exp_data.get('expirations'):
                return None
            
            nearest_date = exp_data['expirations'][0]
            chain_url = f"{BASE_URL}/options/chain/{ticker}/"
            params = {"expiration": nearest_date}
            
            chain_res = requests.get(chain_url, headers=get_headers(), params=params)
            if chain_res.status_code == 200:
                chain = chain_res.json()
                total_volume = sum(chain.get('volume', []))
                if total_volume > 0:
                    return {"volume": total_volume, "expiration": nearest_date}
                    
    except Exception as e:
        print(f"MarketData Options Error for {ticker}: {e}")
        
    return None
