import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from textblob import TextBlob
import logging

logger = logging.getLogger(__name__)

def calculate_macd(prices, fast=12, slow=26, signal=9):
    exp1 = prices.ewm(span=fast, adjust=False).mean()
    exp2 = prices.ewm(span=slow, adjust=False).mean()
    macd_line = exp1 - exp2
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    return macd_line.iloc[-1], signal_line.iloc[-1]

def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1] if not rsi.empty else 50

def calculate_sma(prices, period):
    return prices.rolling(window=period).mean().iloc[-1] if len(prices) >= period else None

def score_catalysts(analyst_ratings, news_sentiment):
    score = 5.0
    details = {}
    
    upgrades = 0
    downgrades = 0
    for rating in (analyst_ratings or []):
        action = rating.get('action', '').lower()
        if 'upgrade' in action or 'buy' in action.lower():
            upgrades += 1
        elif 'downgrade' in action or 'sell' in action.lower():
            downgrades += 1
    
    details['upgrades'] = upgrades
    details['downgrades'] = downgrades
    
    if upgrades > downgrades:
        score += min((upgrades - downgrades) * 0.5, 2.5)
    elif downgrades > upgrades:
        score -= min((downgrades - upgrades) * 0.5, 2.5)
    
    sentiment_scores = []
    for article in (news_sentiment or [])[:10]:
        text = article.get('title', '') + ' ' + article.get('text', '')[:200]
        if text.strip():
            blob = TextBlob(text)
            sentiment_scores.append(blob.sentiment.polarity)
    
    if sentiment_scores:
        avg_sentiment = np.mean(sentiment_scores)
        details['avg_sentiment'] = round(avg_sentiment, 3)
        score += avg_sentiment * 2.5
    else:
        details['avg_sentiment'] = 0
    
    score = max(0, min(10, score))
    return round(score, 1), details

def score_technicals(hist_df):
    score = 5.0
    details = {}
    
    if hist_df is None or len(hist_df) < 26:
        return 5.0, {'error': 'Insufficient data'}
    
    close_prices = hist_df['close']
    current_price = close_prices.iloc[-1]
    details['current_price'] = round(current_price, 2)
    
    macd_line, signal_line = calculate_macd(close_prices)
    details['macd'] = round(macd_line, 4)
    details['macd_signal'] = round(signal_line, 4)
    details['macd_bullish'] = macd_line > signal_line
    
    if macd_line > signal_line:
        score += 2.0
    else:
        score -= 1.0
    
    rsi = calculate_rsi(close_prices)
    details['rsi'] = round(rsi, 2)
    
    if 40 < rsi < 70:
        score += 2.0
        details['rsi_signal'] = 'Momentum'
    elif rsi <= 30:
        score += 1.5
        details['rsi_signal'] = 'Oversold'
    elif rsi >= 70:
        score -= 1.0
        details['rsi_signal'] = 'Overbought'
    else:
        details['rsi_signal'] = 'Neutral'
    
    if 'volume' in hist_df.columns:
        current_volume = hist_df['volume'].iloc[-1]
        sma_volume_20 = hist_df['volume'].rolling(20).mean().iloc[-1]
        details['current_volume'] = int(current_volume)
        details['sma_volume_20'] = int(sma_volume_20) if not np.isnan(sma_volume_20) else None
        details['volume_bullish'] = current_volume > sma_volume_20
        
        if current_volume > sma_volume_20:
            score += 1.0
    
    lowest_low_20 = close_prices.tail(20).min()
    details['stop_loss_support'] = round(lowest_low_20, 2)
    
    score = max(0, min(10, score))
    return round(score, 1), details

def score_value(price_targets, key_metrics, current_price):
    score = 5.0
    details = {}
    
    if price_targets:
        avg_target = price_targets.get('targetConsensus') or price_targets.get('targetMean')
        if avg_target and current_price and current_price > 0:
            upside_pct = ((avg_target - current_price) / current_price) * 100
            details['avg_price_target'] = round(avg_target, 2)
            details['upside_percent'] = round(upside_pct, 2)
            
            if upside_pct > 25:
                score += 2.5
            elif upside_pct > 15:
                score += 2.0
            elif upside_pct > 10:
                score += 1.0
            elif upside_pct < 0:
                score -= 1.5
    else:
        details['avg_price_target'] = None
        details['upside_percent'] = None
    
    if key_metrics:
        peg = key_metrics.get('pegRatioTTM')
        if peg and peg > 0:
            details['peg_ratio'] = round(peg, 2)
            if peg < 1.0:
                score += 2.5
            elif peg < 1.5:
                score += 1.5
            elif peg < 2.0:
                score += 0.5
            else:
                score -= 0.5
        else:
            details['peg_ratio'] = None
    else:
        details['peg_ratio'] = None
    
    score = max(0, min(10, score))
    return round(score, 1), details

def score_macro(fred_df):
    score = 5.0
    details = {}
    
    if fred_df is None or len(fred_df) < 20:
        return 5.0, {'error': 'Insufficient macro data'}
    
    recent_liq = fred_df['net_liquidity'].tail(20)
    
    if len(recent_liq) >= 2:
        x = np.arange(len(recent_liq))
        slope, _ = np.polyfit(x, recent_liq.values, 1)
        details['net_liquidity_slope'] = round(slope, 2)
        details['net_liquidity_current'] = round(fred_df['net_liquidity'].iloc[-1], 2)
        details['liquidity_bullish'] = slope > 0
        
        if slope > 0:
            score += 2.5
        else:
            score -= 1.5
    
    credit_spread = fred_df['credit_spreads'].iloc[-1]
    details['credit_spread'] = round(credit_spread, 2)
    
    credit_recent = fred_df['credit_spreads'].tail(20)
    if len(credit_recent) >= 2:
        x = np.arange(len(credit_recent))
        credit_slope, _ = np.polyfit(x, credit_recent.values, 1)
        details['credit_spread_trend'] = 'Rising' if credit_slope > 0 else 'Falling'
    else:
        credit_slope = 0
        details['credit_spread_trend'] = 'Unknown'
    
    if credit_spread > 4.0 or credit_slope > 0.01:
        score -= 2.0
        details['credit_signal'] = 'Risk Off'
    else:
        score += 1.5
        details['credit_signal'] = 'Risk On'
    
    score = max(0, min(10, score))
    return round(score, 1), details

def check_earnings_blackout(earnings_calendar):
    details = {}
    
    if not earnings_calendar or len(earnings_calendar) == 0:
        details['next_earnings'] = None
        details['days_to_earnings'] = None
        details['blackout'] = False
        return False, details
    
    next_earnings = earnings_calendar[0]
    earnings_date_str = next_earnings.get('date', '')
    
    try:
        earnings_date = datetime.strptime(earnings_date_str, '%Y-%m-%d')
        days_to_earnings = (earnings_date - datetime.now()).days
        
        details['next_earnings'] = earnings_date_str
        details['days_to_earnings'] = days_to_earnings
        details['blackout'] = 0 < days_to_earnings <= 15
        
        return details['blackout'], details
    except:
        details['next_earnings'] = None
        details['days_to_earnings'] = None
        details['blackout'] = False
        return False, details

def score_event_risk(earnings_calendar):
    is_blackout, details = check_earnings_blackout(earnings_calendar)
    
    if is_blackout:
        score = 0
        details['signal'] = 'Earnings Blackout'
    else:
        score = 10
        details['signal'] = 'Clear'
    
    return score, details

def calculate_final_score(catalysts, technicals, value, macro, event_risk):
    weights = {
        'technicals': 0.35,
        'catalysts': 0.20,
        'macro': 0.20,
        'value': 0.15,
        'event_risk': 0.10
    }
    
    final_score = (
        technicals * weights['technicals'] +
        catalysts * weights['catalysts'] +
        macro * weights['macro'] +
        value * weights['value'] +
        event_risk * weights['event_risk']
    )
    
    return round(final_score, 1)

def get_verdict(score, is_blackout=False):
    if is_blackout:
        return "WAIT (Earnings)", "warning"
    
    if score >= 8.0:
        return "Strong Buy (Sniper Entry)", "success"
    elif score >= 6.0:
        return "Watchlist (Setup Developing)", "info"
    else:
        return "Pass / Hold", "danger"
