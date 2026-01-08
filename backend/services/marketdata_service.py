import requests
import os
from datetime import datetime, timedelta

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

def get_put_call_ratio(ticker):
    """
    Calculate Put/Call Ratio from MarketData options chain.
    Fetches the expiration closest to 30 days out for consistency.
    Returns PCR value or None if unavailable.
    """
    ticker = ticker.upper()
    exp_url = f"{BASE_URL}/options/expirations/{ticker}/"
    
    try:
        exp_res = requests.get(exp_url, headers=get_headers(), timeout=10)
        if exp_res.status_code not in [200, 203]:
            print(f"MarketData expirations failed for {ticker}: {exp_res.status_code}")
            return None
            
        exp_data = exp_res.json()
        if exp_data.get('s') != 'ok' or not exp_data.get('expirations'):
            print(f"No options expirations for {ticker}")
            return None
        
        expirations = exp_data['expirations']
        target_date = datetime.now() + timedelta(days=30)
        
        closest_exp = min(expirations, key=lambda x: abs(datetime.strptime(x, '%Y-%m-%d') - target_date))
        
        chain_url = f"{BASE_URL}/options/chain/{ticker}/"
        params = {"expiration": closest_exp}
        
        chain_res = requests.get(chain_url, headers=get_headers(), params=params, timeout=15)
        if chain_res.status_code not in [200, 203]:
            print(f"MarketData chain failed for {ticker}: {chain_res.status_code}")
            return None
            
        chain = chain_res.json()
        if chain.get('s') != 'ok':
            return None
        
        option_types = chain.get('optionType', [])
        volumes = chain.get('volume', [])
        
        if not option_types or not volumes or len(option_types) != len(volumes):
            print(f"Invalid chain data for {ticker}")
            return None
        
        call_volume = 0
        put_volume = 0
        
        for i, opt_type in enumerate(option_types):
            vol = volumes[i] if volumes[i] is not None else 0
            if opt_type == 'call':
                call_volume += vol
            elif opt_type == 'put':
                put_volume += vol
        
        if call_volume == 0:
            print(f"No call volume for {ticker} in MarketData")
            return None
        
        pcr = put_volume / call_volume
        print(f"MarketData PCR for {ticker}: {pcr:.2f} (Puts: {put_volume}, Calls: {call_volume}, Exp: {closest_exp})")
        return round(pcr, 2)
        
    except Exception as e:
        print(f"MarketData Options Error for {ticker}: {e}")
        
    return None
