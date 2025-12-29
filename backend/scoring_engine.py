import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from textblob import TextBlob
from scipy.signal import argrelextrema
import logging

logger = logging.getLogger(__name__)

def calculate_macd_series(prices, fast=12, slow=26, signal=9):
    """Calculate standard MACD (Moving Average Convergence Divergence)
    
    MACD Line = 12-period EMA - 26-period EMA (in absolute price terms)
    Signal Line = 9-period EMA of MACD Line
    """
    ema_fast = prices.ewm(span=fast, min_periods=fast, adjust=False).mean()
    ema_slow = prices.ewm(span=slow, min_periods=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, min_periods=signal, adjust=False).mean()
    return macd_line, signal_line

def calculate_macd(prices, fast=12, slow=26, signal=9):
    macd_line, signal_line = calculate_macd_series(prices, fast, slow, signal)
    return macd_line.iloc[-1], signal_line.iloc[-1]

def calculate_rsi_series(prices, period=14):
    """Calculate RSI using Wilder's smoothing (EMA) for accurate values"""
    delta = prices.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    
    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_rsi(prices, period=14):
    rsi = calculate_rsi_series(prices, period)
    return rsi.iloc[-1] if not rsi.empty else 50

def detect_rsi_divergence(prices, rsi_series, lookback=30, order=5):
    if len(prices) < lookback or len(rsi_series) < lookback:
        return None, {}
    
    recent_prices = prices.tail(lookback).values
    recent_rsi = rsi_series.tail(lookback).values
    
    if len(recent_prices) < order * 2:
        return None, {}
    
    try:
        price_lows_idx = argrelextrema(recent_prices, np.less_equal, order=order)[0]
        price_highs_idx = argrelextrema(recent_prices, np.greater_equal, order=order)[0]
        rsi_lows_idx = argrelextrema(recent_rsi, np.less_equal, order=order)[0]
        rsi_highs_idx = argrelextrema(recent_rsi, np.greater_equal, order=order)[0]
        
        if len(price_lows_idx) >= 2 and len(rsi_lows_idx) >= 2:
            last_price_low_idx = price_lows_idx[-1]
            prev_price_low_idx = price_lows_idx[-2]
            
            if (recent_prices[last_price_low_idx] < recent_prices[prev_price_low_idx] and
                recent_rsi[last_price_low_idx] > recent_rsi[prev_price_low_idx]):
                return 'bullish', {
                    'divergence_type': 'Bullish Divergence',
                    'price_pattern': 'Lower Low',
                    'rsi_pattern': 'Higher Low'
                }
        
        if len(price_highs_idx) >= 2 and len(rsi_highs_idx) >= 2:
            last_price_high_idx = price_highs_idx[-1]
            prev_price_high_idx = price_highs_idx[-2]
            
            if (recent_prices[last_price_high_idx] > recent_prices[prev_price_high_idx] and
                recent_rsi[last_price_high_idx] < recent_rsi[prev_price_high_idx]):
                return 'bearish', {
                    'divergence_type': 'Bearish Divergence',
                    'price_pattern': 'Higher High',
                    'rsi_pattern': 'Lower High'
                }
        
    except Exception as e:
        logger.debug(f"Divergence detection error: {e}")
    
    return None, {}

def detect_macd_crossover(macd_series, signal_series):
    if len(macd_series) < 2 or len(signal_series) < 2:
        return None
    
    diff_today = macd_series.iloc[-1] - signal_series.iloc[-1]
    diff_yesterday = macd_series.iloc[-2] - signal_series.iloc[-2]
    
    if diff_today > 0 and diff_yesterday <= 0:
        return 'golden_cross'
    elif diff_today < 0 and diff_yesterday >= 0:
        return 'death_cross'
    
    return None

def calculate_sma(prices, period):
    return prices.rolling(window=period).mean().iloc[-1] if len(prices) >= period else None

def compare_grades(previous_grade, new_grade):
    grade_ranks = {
        'strong sell': 1, 'sell': 2, 'underweight': 2,
        'underperform': 3, 'reduce': 3,
        'hold': 4, 'neutral': 4, 'market perform': 4, 'equal-weight': 4, 'sector perform': 4,
        'buy': 5, 'overweight': 5, 'outperform': 5, 'accumulate': 5,
        'strong buy': 6
    }
    prev_rank = grade_ranks.get(previous_grade.lower(), 4)
    new_rank = grade_ranks.get(new_grade.lower(), 4)
    
    if new_rank > prev_rank:
        return 'upgrade'
    elif new_rank < prev_rank:
        return 'downgrade'
    return 'maintain'

def score_catalysts(analyst_ratings, news_sentiment):
    score = 5.0
    details = {}
    
    upgrades = 0
    downgrades = 0
    maintains = 0
    
    for rating in (analyst_ratings or []):
        action = rating.get('action', '').lower()
        previous_grade = rating.get('previousGrade', '')
        new_grade = rating.get('newGrade', '')
        
        if action == 'upgrade':
            upgrades += 1
        elif action == 'downgrade':
            downgrades += 1
        elif previous_grade and new_grade:
            comparison = compare_grades(previous_grade, new_grade)
            if comparison == 'upgrade':
                upgrades += 1
            elif comparison == 'downgrade':
                downgrades += 1
            else:
                maintains += 1
        else:
            maintains += 1
    
    details['upgrades'] = upgrades
    details['downgrades'] = downgrades
    details['maintains'] = maintains
    details['total_ratings'] = len(analyst_ratings or [])
    
    if upgrades > downgrades:
        score += min((upgrades - downgrades) * 0.5, 2.5)
    elif downgrades > upgrades:
        score -= min((downgrades - upgrades) * 0.5, 2.5)
    
    sentiment_scores = []
    for article in (news_sentiment or [])[:10]:
        title = article.get('title', '')
        if title and title.strip():
            blob = TextBlob(title)
            sentiment_scores.append(blob.sentiment.polarity)
    
    if sentiment_scores:
        avg_sentiment = float(np.mean(sentiment_scores))
        details['avg_sentiment'] = round(avg_sentiment, 3)
        details['articles_analyzed'] = len(sentiment_scores)
        score += avg_sentiment * 2.5
    else:
        details['avg_sentiment'] = 0
        details['articles_analyzed'] = 0
    
    score = max(0, min(10, score))
    return round(score, 1), details

def score_technicals(hist_df):
    score = 5.0
    details = {}
    
    if hist_df is None or len(hist_df) < 60:
        return 5.0, {'error': 'Insufficient data (need 60+ days)'}
    
    close_prices = hist_df['close']
    current_price = float(close_prices.iloc[-1])
    details['current_price'] = round(current_price, 2)
    
    rsi_series = calculate_rsi_series(close_prices, period=14)
    rsi = float(rsi_series.iloc[-1]) if not rsi_series.empty else 50
    details['rsi'] = round(rsi, 2)
    
    divergence_type, divergence_details = detect_rsi_divergence(close_prices, rsi_series, lookback=30, order=5)
    
    if divergence_type == 'bullish':
        score += 3.0
        details['rsi_signal'] = 'Bullish Divergence'
        details['divergence_detected'] = True
        details.update(divergence_details)
    elif divergence_type == 'bearish':
        score -= 3.0
        details['rsi_signal'] = 'Bearish Divergence'
        details['divergence_detected'] = True
        details.update(divergence_details)
    else:
        details['divergence_detected'] = False
        if 40 <= rsi <= 50:
            score += 1.5
            details['rsi_signal'] = 'Neutral-Bullish'
        elif rsi > 75:
            score -= 1.5
            details['rsi_signal'] = 'Overextended'
        elif rsi < 30:
            score += 1.0
            details['rsi_signal'] = 'Oversold'
        elif rsi > 50 and rsi <= 75:
            score += 1.0
            details['rsi_signal'] = 'Momentum'
        else:
            details['rsi_signal'] = 'Neutral'
    
    macd_series, signal_series = calculate_macd_series(close_prices)
    macd_line = float(macd_series.iloc[-1])
    signal_line = float(signal_series.iloc[-1])
    details['macd'] = round(macd_line, 4)
    details['macd_signal'] = round(signal_line, 4)
    
    crossover = detect_macd_crossover(macd_series, signal_series)
    
    if crossover == 'golden_cross':
        score += 2.5
        details['macd_bullish'] = True
        details['macd_crossover'] = 'Golden Cross'
    elif crossover == 'death_cross':
        score -= 2.0
        details['macd_bullish'] = False
        details['macd_crossover'] = 'Death Cross'
    elif macd_line > signal_line:
        score += 1.5
        details['macd_bullish'] = True
        details['macd_crossover'] = 'Above Signal'
    else:
        score -= 1.0
        details['macd_bullish'] = False
        details['macd_crossover'] = 'Below Signal'
    
    if 'volume' in hist_df.columns and 'open' in hist_df.columns:
        current_volume = int(hist_df['volume'].iloc[-1])
        sma_volume_20 = hist_df['volume'].rolling(20).mean().iloc[-1]
        current_open = float(hist_df['open'].iloc[-1])
        is_green_day = current_price > current_open
        
        details['current_volume'] = current_volume
        details['sma_volume_20'] = int(sma_volume_20) if not np.isnan(sma_volume_20) else None
        details['is_green_day'] = is_green_day
        
        if current_volume > sma_volume_20 and is_green_day:
            score += 1.5
            details['volume_bullish'] = True
            details['volume_signal'] = 'Strong Buying'
        elif current_volume > sma_volume_20 and not is_green_day:
            score -= 0.5
            details['volume_bullish'] = False
            details['volume_signal'] = 'Heavy Selling'
        else:
            details['volume_bullish'] = False
            details['volume_signal'] = 'Low Volume'
    elif 'volume' in hist_df.columns:
        current_volume = int(hist_df['volume'].iloc[-1])
        sma_volume_20 = hist_df['volume'].rolling(20).mean().iloc[-1]
        details['current_volume'] = current_volume
        details['sma_volume_20'] = int(sma_volume_20) if not np.isnan(sma_volume_20) else None
        details['volume_bullish'] = bool(current_volume > sma_volume_20)
        if current_volume > sma_volume_20:
            score += 1.0
    
    if 'low' in hist_df.columns:
        lowest_low_20 = float(hist_df['low'].tail(20).min())
    else:
        lowest_low_20 = float(close_prices.tail(20).min())
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
            details['avg_price_target'] = round(float(avg_target), 2)
            details['upside_percent'] = round(float(upside_pct), 2)
            
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
        peg = key_metrics.get('priceToEarningsGrowthRatioTTM')
        
        if peg and peg > 0 and peg != 'N/A':
            details['peg_ratio'] = round(float(peg), 2)
            details['valuation_metric'] = 'PEG'
            details['valuation_label'] = 'Using PEG Ratio TTM'
            
            if peg < 1.0:
                score += 2.5
                details['valuation_signal'] = 'Undervalued Growth'
            elif peg > 2.0:
                score -= 1.5
                details['valuation_signal'] = 'Overvalued'
            else:
                details['valuation_signal'] = 'Neutral'
        else:
            ps_ratio = key_metrics.get('priceToSalesRatioTTM')
            
            if ps_ratio and ps_ratio > 0:
                details['peg_ratio'] = None
                details['ps_ratio'] = round(float(ps_ratio), 2)
                details['valuation_metric'] = 'P/S'
                details['valuation_label'] = 'Using P/S (PEG N/A)'
                
                if ps_ratio < 3.0:
                    score += 2.0
                    details['valuation_signal'] = 'Cheap Revenue'
                elif ps_ratio > 10.0:
                    score -= 1.5
                    details['valuation_signal'] = 'Expensive'
                else:
                    details['valuation_signal'] = 'Neutral'
            else:
                details['peg_ratio'] = None
                details['ps_ratio'] = None
                details['valuation_metric'] = None
                details['valuation_label'] = 'No valuation data'
                details['valuation_signal'] = 'Unknown'
    else:
        details['peg_ratio'] = None
        details['valuation_metric'] = None
        details['valuation_label'] = 'No metrics available'
    
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
        slope = float(slope)
        details['net_liquidity_slope'] = round(slope, 2)
        details['net_liquidity_current'] = round(float(fred_df['net_liquidity'].iloc[-1]), 2)
        details['liquidity_bullish'] = bool(slope > 0)
        
        if slope > 0:
            score += 2.5
        else:
            score -= 1.5
    
    credit_spread = float(fred_df['credit_spreads'].iloc[-1])
    details['credit_spread'] = round(credit_spread, 2)
    
    credit_recent = fred_df['credit_spreads'].tail(20)
    if len(credit_recent) >= 2:
        x = np.arange(len(credit_recent))
        credit_slope, _ = np.polyfit(x, credit_recent.values, 1)
        credit_slope = float(credit_slope)
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
        return "Strong Buy", "success"
    elif score >= 6.0:
        return "Buy", "info"
    elif score >= 4.0:
        return "Hold", "warning"
    else:
        return "Avoid / Sell", "danger"
