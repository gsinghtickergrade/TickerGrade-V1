import requests
import os

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
                    "change_percent": data['changepct'][0] * 100,
                    "volume": data['volume'][0],
                    "prev_close": data['last'][0] - data['change'][0],
                    "source": "MarketData (Real-Time)"
                }
    except Exception as e:
        print(f"MarketData Price Error for {ticker}: {e}")
    
    return None
