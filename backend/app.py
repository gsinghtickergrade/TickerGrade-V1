from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import logging
import pandas as pd

from data_services import (
    get_stock_quote, get_stock_profile, get_historical_prices,
    get_analyst_ratings, get_stock_news_sentiment, get_analyst_price_targets,
    get_key_metrics, get_earnings_calendar, get_fred_data, get_spy_data
)
from scoring_engine import (
    score_catalysts, score_technicals, score_value, score_macro,
    score_event_risk, calculate_final_score, get_verdict
)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
CORS(app)

@app.route('/api/analyze/<path:ticker>', methods=['GET'])
def analyze_stock(ticker):
    try:
        ticker = ticker.upper()
        
        quote = get_stock_quote(ticker)
        if not quote:
            return jsonify({'error': 'Invalid ticker symbol or no data available'}), 404
        
        profile = get_stock_profile(ticker)
        hist_df = get_historical_prices(ticker, days=365)
        analyst_ratings = get_analyst_ratings(ticker)
        news = get_stock_news_sentiment(ticker)
        price_targets = get_analyst_price_targets(ticker)
        key_metrics = get_key_metrics(ticker)
        earnings = get_earnings_calendar(ticker)
        fred_df = get_fred_data()
        
        current_price = quote.get('price', 0)
        
        catalysts_score, catalysts_details = score_catalysts(analyst_ratings, news)
        technicals_score, technicals_details = score_technicals(hist_df)
        value_score, value_details = score_value(price_targets, key_metrics, current_price)
        macro_score, macro_details = score_macro(fred_df)
        event_risk_score, event_risk_details = score_event_risk(earnings)
        
        is_blackout = event_risk_details.get('blackout', False)
        
        final_score = calculate_final_score(
            catalysts_score, technicals_score, value_score, macro_score, event_risk_score
        )
        
        verdict, verdict_type = get_verdict(final_score, is_blackout)
        
        stop_loss = technicals_details.get('stop_loss_support', current_price * 0.95)
        target_price = value_details.get('avg_price_target', current_price * 1.10)
        
        price_history = []
        if hist_df is not None and len(hist_df) > 0:
            from scoring_engine import calculate_rsi_series, calculate_macd_series
            
            close_prices = hist_df['close']
            rsi_series = calculate_rsi_series(close_prices, period=14)
            macd_series, signal_series = calculate_macd_series(close_prices)
            histogram_series = macd_series - signal_series
            
            volume_sma = hist_df['volume'].rolling(20).mean() if 'volume' in hist_df.columns else None
            
            for i, (_, row) in enumerate(hist_df.iterrows()):
                entry = {
                    'date': row['date'].strftime('%Y-%m-%d') if hasattr(row['date'], 'strftime') else str(row['date'])[:10],
                    'price': round(row['close'], 2),
                    'open': round(row['open'], 2) if 'open' in row else None,
                    'high': round(row['high'], 2) if 'high' in row else None,
                    'low': round(row['low'], 2) if 'low' in row else None,
                }
                
                if i < len(rsi_series) and not pd.isna(rsi_series.iloc[i]):
                    entry['rsi'] = round(float(rsi_series.iloc[i]), 2)
                
                if i < len(macd_series) and not pd.isna(macd_series.iloc[i]):
                    entry['macd'] = round(float(macd_series.iloc[i]), 4)
                
                if i < len(signal_series) and not pd.isna(signal_series.iloc[i]):
                    entry['macd_signal'] = round(float(signal_series.iloc[i]), 4)
                
                if i < len(histogram_series) and not pd.isna(histogram_series.iloc[i]):
                    entry['histogram'] = round(float(histogram_series.iloc[i]), 4)
                
                if 'volume' in hist_df.columns:
                    entry['volume'] = int(row['volume'])
                    if volume_sma is not None and i < len(volume_sma) and not pd.isna(volume_sma.iloc[i]):
                        entry['volume_sma'] = int(volume_sma.iloc[i])
                
                price_history.append(entry)
        
        return jsonify({
            'ticker': ticker,
            'company_name': profile.get('companyName', ticker) if profile else ticker,
            'current_price': round(current_price, 2),
            'final_score': final_score,
            'verdict': verdict,
            'verdict_type': verdict_type,
            'action_card': {
                'entry_zone': round(current_price, 2),
                'stop_loss': round(stop_loss, 2),
                'target': round(target_price, 2) if target_price else None,
                'risk_reward': round((target_price - current_price) / (current_price - stop_loss), 2) if target_price and stop_loss < current_price else None
            },
            'pillars': {
                'catalysts': {
                    'score': catalysts_score,
                    'weight': 20,
                    'name': 'Catalysts & Sentiment',
                    'details': catalysts_details
                },
                'technicals': {
                    'score': technicals_score,
                    'weight': 35,
                    'name': 'Technical Structure',
                    'details': technicals_details
                },
                'value': {
                    'score': value_score,
                    'weight': 15,
                    'name': 'Relative Value',
                    'details': value_details
                },
                'macro': {
                    'score': macro_score,
                    'weight': 20,
                    'name': 'Macro Liquidity',
                    'details': macro_details
                },
                'event_risk': {
                    'score': event_risk_score,
                    'weight': 10,
                    'name': 'Event Risk',
                    'details': event_risk_details
                }
            },
            'price_history': price_history
        })
    
    except Exception as e:
        logger.error(f"Error analyzing {ticker}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/macro/net-liquidity', methods=['GET'])
def get_net_liquidity():
    import pandas as pd
    try:
        fred_df = get_fred_data()
        spy_df = get_spy_data()
        
        if fred_df is None:
            return jsonify({'error': 'Unable to fetch FRED data'}), 500
        
        fred_df = fred_df.copy()
        fred_df.index = pd.to_datetime(fred_df.index).normalize()
        
        if spy_df is not None:
            spy_df = spy_df.copy()
            spy_df.index = pd.to_datetime(spy_df.index).normalize()
            spy_df = spy_df[~spy_df.index.duplicated(keep='first')]
            spy_reindexed = spy_df['close'].reindex(fred_df.index, method='ffill')
            fred_df['spy_close'] = spy_reindexed
        
        fred_df = fred_df.dropna(subset=['net_liquidity'])
        
        if len(fred_df) > 0:
            liq_start = fred_df['net_liquidity'].iloc[0]
            fred_df['net_liquidity_norm'] = (fred_df['net_liquidity'] / liq_start) * 100
            
            if 'spy_close' in fred_df.columns:
                fred_df_with_spy = fred_df.dropna(subset=['spy_close'])
                if len(fred_df_with_spy) > 0:
                    spy_start = fred_df_with_spy['spy_close'].iloc[0]
                    fred_df['spy_norm'] = (fred_df['spy_close'] / spy_start) * 100
        
        data = []
        for date, row in fred_df.iterrows():
            entry = {
                'date': date.strftime('%Y-%m-%d'),
                'net_liquidity': round(float(row['net_liquidity']) / 1000000, 2),
                'net_liquidity_norm': round(float(row.get('net_liquidity_norm', 100)), 2)
            }
            
            if 'spy_close' in row.index and pd.notna(row['spy_close']):
                entry['spy_price'] = round(float(row['spy_close']), 2)
            if 'spy_norm' in row.index and pd.notna(row['spy_norm']):
                entry['spy_norm'] = round(float(row['spy_norm']), 2)
            
            data.append(entry)
        
        return jsonify({
            'data': data[-90:],
            'current_net_liquidity': round(float(fred_df['net_liquidity'].iloc[-1]) / 1000000, 2),
            'credit_spread': round(float(fred_df['credit_spreads'].iloc[-1]), 2)
        })
    
    except Exception as e:
        logger.error(f"Error fetching net liquidity: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def root_health_check():
    return jsonify({'status': 'healthy', 'service': 'TickerGrade API'})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
