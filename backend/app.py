from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import logging
import pandas as pd

from models import db, Feedback, TradeIdea, TrafficLog, Watchlist, ScanStaging
import hashlib
from datetime import datetime, timedelta
from sqlalchemy import func

from data_services import (
    get_stock_quote, get_stock_profile, get_historical_prices,
    get_analyst_ratings, get_stock_news_sentiment, get_analyst_price_targets,
    get_key_metrics, get_earnings_calendar, get_fred_data, get_spy_data
)
from scoring_engine import (
    score_catalysts, score_technicals, score_value, score_macro,
    score_event_risk, calculate_final_score, get_verdict
)
from services.marketdata_service import get_realtime_price
from services.scanner import run_scanner

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    db.session.rollback()
    return jsonify({'error': 'Internal server error. Please try again.'}), 500


@app.errorhandler(Exception)
def handle_exception(error):
    logger.error(f"Unhandled exception: {error}")
    db.session.rollback()
    return jsonify({'error': 'An unexpected error occurred. Please try again.'}), 500


@app.before_request
def track_traffic():
    path = request.path
    
    if path.startswith('/static') or path.endswith(('.css', '.js', '.png', '.jpg', '.ico', '.svg', '.woff', '.woff2')):
        return
    
    if path.startswith('/api/admin') or path == '/admin':
        return
    
    try:
        ip = request.remote_addr or 'unknown'
        user_agent = request.headers.get('User-Agent', 'unknown')
        today = datetime.utcnow().strftime('%Y-%m-%d')
        
        hash_input = f"{ip}{user_agent}{today}"
        visitor_hash = hashlib.md5(hash_input.encode()).hexdigest()
        
        log = TrafficLog(page=path, visitor_hash=visitor_hash)
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        logger.warning(f"Traffic tracking error: {e}")
        db.session.rollback()


def analyze_stock_internal(ticker):
    ticker = ticker.upper()
    
    quote = get_stock_quote(ticker)
    if not quote:
        return {'error': 'Invalid ticker symbol or no data available'}
    
    profile = get_stock_profile(ticker)
    hist_df = get_historical_prices(ticker, days=730)
    analyst_ratings = get_analyst_ratings(ticker)
    news = get_stock_news_sentiment(ticker)
    price_targets = get_analyst_price_targets(ticker)
    key_metrics = get_key_metrics(ticker)
    earnings = get_earnings_calendar(ticker)
    fred_df = get_fred_data()
    
    realtime_data = get_realtime_price(ticker)
    if realtime_data:
        current_price = realtime_data.get('price', 0)
        price_change = realtime_data.get('change', 0)
        price_change_percent = realtime_data.get('change_percent', 0)
        price_source = realtime_data.get('source', 'MarketData')
        logger.info(f"Using MarketData real-time price for {ticker}: ${current_price}")
    else:
        current_price = quote.get('price', 0)
        price_change = quote.get('change', 0)
        price_change_percent = quote.get('changePercentage', 0)
        price_source = 'FMP (Delayed)'
        logger.info(f"Falling back to FMP quote for {ticker}: ${current_price}")
    
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
    
    atr_14 = technicals_details.get('atr_14', None)
    analyst_target = value_details.get('avg_price_target', None)
    
    if atr_14:
        atr_stop_dist = 2.5 * atr_14
        min_stop_dist = current_price * 0.04
        stop_loss = current_price - max(atr_stop_dist, min_stop_dist)
        atr_target = current_price + (5.0 * atr_14)
        if analyst_target and analyst_target > current_price:
            target_price = min(atr_target, analyst_target)
        else:
            target_price = atr_target
    else:
        stop_loss = technicals_details.get('key_support_level', current_price * 0.95)
        target_price = analyst_target if (analyst_target and analyst_target > current_price) else current_price * 1.10
    
    return {
        'ticker': ticker,
        'company_name': profile.get('companyName', ticker) if profile else ticker,
        'current_price': round(current_price, 2),
        'price_change': round(price_change, 2) if price_change else 0,
        'price_change_percent': round(price_change_percent, 2) if price_change_percent else 0,
        'price_source': price_source,
        'total_score': final_score,
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
        }
    }


@app.route('/api/analyze/<path:ticker>', methods=['GET'])
def analyze_stock(ticker):
    try:
        result = analyze_stock_internal(ticker)
        
        if 'error' in result:
            return jsonify(result), 404
        
        hist_df = get_historical_prices(ticker.upper(), days=730)
        price_history = []
        if hist_df is not None and len(hist_df) > 0:
            from scoring_engine import calculate_rsi_series, calculate_macd_series
            
            close_prices = hist_df['close']
            rsi_series = calculate_rsi_series(close_prices, period=14)
            macd_series, signal_series = calculate_macd_series(close_prices)
            histogram_series = macd_series - signal_series
            
            volume_sma = hist_df['volume'].rolling(20).mean() if 'volume' in hist_df.columns else None
            
            sma_50 = close_prices.rolling(window=50).mean()
            sma_200 = close_prices.rolling(window=200).mean()
            
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
                
                if i < len(sma_50) and not pd.isna(sma_50.iloc[i]):
                    entry['sma_50'] = round(float(sma_50.iloc[i]), 2)
                
                if i < len(sma_200) and not pd.isna(sma_200.iloc[i]):
                    entry['sma_200'] = round(float(sma_200.iloc[i]), 2)
                
                price_history.append(entry)
            
            price_history = price_history[-365:]
        
        result['final_score'] = result.pop('total_score')
        result['price_history'] = price_history
        
        return jsonify(result)
    
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
        fred_df.index = pd.to_datetime(fred_df.index).tz_localize(None).normalize()
        
        if spy_df is not None:
            spy_df = spy_df.copy()
            spy_df.index = pd.to_datetime(spy_df.index).tz_localize(None).normalize()
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


@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        message = data.get('message', '').strip()
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        category = data.get('category', 'Other')
        if category not in ['Bug', 'Data Error', 'Feature', 'Other']:
            category = 'Other'
        
        feedback = Feedback(
            category=category,
            ticker=data.get('ticker', '').strip().upper() or None,
            message=message,
            contact_email=data.get('contact_email', '').strip() or None
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        logger.info(f"Feedback received: {category} - {message[:50]}...")
        return jsonify({'success': True, 'message': 'Report received. Thank you for helping us improve.'})
    
    except Exception as e:
        logger.error(f"Error saving feedback: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to save feedback'}), 500


@app.route('/api/trade-ideas', methods=['GET'])
def get_trade_ideas():
    try:
        ideas = TradeIdea.query.filter_by(active=True).order_by(TradeIdea.timestamp.desc()).all()
        return jsonify({
            'ideas': [{
                'id': idea.id,
                'ticker': idea.ticker,
                'direction': idea.direction,
                'thesis': idea.thesis,
                'timestamp': idea.timestamp.isoformat(),
                'admin_comment': idea.admin_comment,
                'score': idea.score
            } for idea in ideas]
        })
    except Exception as e:
        logger.error(f"Error fetching trade ideas: {e}")
        return jsonify({'error': 'Failed to fetch trade ideas'}), 500


@app.route('/api/admin/verify', methods=['POST'])
def verify_admin():
    data = request.get_json()
    password = data.get('password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password:
        return jsonify({'error': 'Admin not configured'}), 500
    
    if password == admin_password:
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid password'}), 401


@app.route('/api/admin/trade-ideas', methods=['GET'])
def admin_get_trade_ideas():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        ideas = TradeIdea.query.order_by(TradeIdea.timestamp.desc()).all()
        return jsonify({
            'ideas': [{
                'id': idea.id,
                'ticker': idea.ticker,
                'direction': idea.direction,
                'thesis': idea.thesis,
                'timestamp': idea.timestamp.isoformat(),
                'active': idea.active
            } for idea in ideas]
        })
    except Exception as e:
        logger.error(f"Error fetching trade ideas: {e}")
        return jsonify({'error': 'Failed to fetch trade ideas'}), 500


@app.route('/api/admin/trade-ideas', methods=['POST'])
def admin_create_trade_idea():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        
        ticker = data.get('ticker', '').strip().upper()
        direction = data.get('direction', '')
        thesis = data.get('thesis', '').strip()
        
        if not ticker or not direction or not thesis:
            return jsonify({'error': 'Ticker, direction, and thesis are required'}), 400
        
        valid_directions = ['Strong Bullish', 'Bullish', 'Neutral', 'Bearish']
        if direction not in valid_directions:
            return jsonify({'error': f'Direction must be one of: {", ".join(valid_directions)}'}), 400
        
        idea = TradeIdea(ticker=ticker, direction=direction, thesis=thesis)
        db.session.add(idea)
        db.session.commit()
        
        return jsonify({'success': True, 'id': idea.id})
    except Exception as e:
        logger.error(f"Error creating trade idea: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create trade idea'}), 500


@app.route('/api/admin/trade-ideas/<int:idea_id>', methods=['PUT'])
def admin_update_trade_idea(idea_id):
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        idea = TradeIdea.query.get(idea_id)
        if not idea:
            return jsonify({'error': 'Trade idea not found'}), 404
        
        data = request.get_json()
        
        ticker = data.get('ticker', '').strip().upper()
        direction = data.get('direction', '')
        thesis = data.get('thesis', '').strip()
        
        if not ticker or not direction or not thesis:
            return jsonify({'error': 'Ticker, direction, and thesis are required'}), 400
        
        valid_directions = ['Strong Bullish', 'Bullish', 'Neutral', 'Bearish']
        if direction not in valid_directions:
            return jsonify({'error': f'Direction must be one of: {", ".join(valid_directions)}'}), 400
        
        idea.ticker = ticker
        idea.direction = direction
        idea.thesis = thesis
        db.session.commit()
        
        return jsonify({'success': True, 'id': idea.id})
    except Exception as e:
        logger.error(f"Error updating trade idea: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update trade idea'}), 500


@app.route('/api/admin/trade-ideas/<int:idea_id>', methods=['DELETE'])
def admin_delete_trade_idea(idea_id):
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        idea = TradeIdea.query.get(idea_id)
        if not idea:
            return jsonify({'error': 'Trade idea not found'}), 404
        
        db.session.delete(idea)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error deleting trade idea: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete trade idea'}), 500


@app.route('/api/admin/feedback', methods=['GET'])
def admin_get_feedback():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        feedback_list = Feedback.query.order_by(Feedback.timestamp.desc()).all()
        return jsonify({
            'feedback': [
                {
                    'id': f.id,
                    'category': f.category,
                    'ticker': f.ticker,
                    'message': f.message,
                    'contact_email': f.contact_email,
                    'timestamp': f.timestamp.isoformat() if f.timestamp else None
                }
                for f in feedback_list
            ]
        })
    except Exception as e:
        logger.error(f"Error fetching feedback: {e}")
        return jsonify({'error': 'Failed to fetch feedback'}), 500


@app.route('/api/admin/traffic-stats', methods=['GET'])
def admin_get_traffic_stats():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        now = datetime.utcnow()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        
        views_24h = TrafficLog.query.filter(TrafficLog.timestamp >= last_24h).count()
        uniques_24h = db.session.query(func.count(func.distinct(TrafficLog.visitor_hash))).filter(TrafficLog.timestamp >= last_24h).scalar() or 0
        
        daily_stats = db.session.query(
            func.date(TrafficLog.timestamp).label('date'),
            func.count(TrafficLog.id).label('views'),
            func.count(func.distinct(TrafficLog.visitor_hash)).label('uniques')
        ).filter(
            TrafficLog.timestamp >= last_7d
        ).group_by(
            func.date(TrafficLog.timestamp)
        ).order_by(
            func.date(TrafficLog.timestamp).desc()
        ).all()
        
        top_pages = db.session.query(
            TrafficLog.page,
            func.count(TrafficLog.id).label('count')
        ).group_by(
            TrafficLog.page
        ).order_by(
            func.count(TrafficLog.id).desc()
        ).limit(5).all()
        
        return jsonify({
            'views_24h': views_24h,
            'uniques_24h': uniques_24h,
            'daily_stats': [
                {
                    'date': str(row.date),
                    'views': row.views,
                    'uniques': row.uniques
                }
                for row in daily_stats
            ],
            'top_pages': [
                {
                    'page': row.page,
                    'count': row.count
                }
                for row in top_pages
            ]
        })
    except Exception as e:
        logger.error(f"Error fetching traffic stats: {e}")
        return jsonify({'error': 'Failed to fetch traffic stats'}), 500


@app.route('/api/admin/watchlist', methods=['GET'])
def admin_get_watchlist():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        items = Watchlist.query.order_by(Watchlist.ticker).all()
        return jsonify({
            'watchlist': [{'id': w.id, 'ticker': w.ticker} for w in items]
        })
    except Exception as e:
        logger.error(f"Error fetching watchlist: {e}")
        return jsonify({'error': 'Failed to fetch watchlist'}), 500


@app.route('/api/admin/watchlist', methods=['POST'])
def admin_add_watchlist():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        ticker = data.get('ticker', '').strip().upper()
        
        if not ticker:
            return jsonify({'error': 'Ticker is required'}), 400
        
        existing = Watchlist.query.filter_by(ticker=ticker).first()
        if existing:
            return jsonify({'error': f'{ticker} already in watchlist'}), 400
        
        item = Watchlist(ticker=ticker)
        db.session.add(item)
        db.session.commit()
        
        return jsonify({'success': True, 'id': item.id, 'ticker': item.ticker})
    except Exception as e:
        logger.error(f"Error adding to watchlist: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to add ticker'}), 500


@app.route('/api/admin/watchlist/<int:item_id>', methods=['DELETE'])
def admin_delete_watchlist(item_id):
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        item = Watchlist.query.get(item_id)
        if not item:
            return jsonify({'error': 'Ticker not found'}), 404
        
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error deleting from watchlist: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete ticker'}), 500


@app.route('/api/admin/scanner/run', methods=['POST'])
def admin_run_scanner():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        results = run_scanner(analyze_stock_internal)
        return jsonify({
            'success': True,
            'scanned': results['scanned'],
            'bullish': results['bullish'],
            'bearish': results['bearish'],
            'errors': results['errors']
        })
    except Exception as e:
        logger.error(f"Scanner error: {e}")
        return jsonify({'error': 'Scanner failed'}), 500


@app.route('/api/admin/staging', methods=['GET'])
def admin_get_staging():
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        items = ScanStaging.query.order_by(ScanStaging.scanned_at.desc()).all()
        return jsonify({
            'staging': [{
                'id': s.id,
                'ticker': s.ticker,
                'score': s.score,
                'direction': s.direction,
                'scanned_at': s.scanned_at.isoformat() + 'Z'
            } for s in items]
        })
    except Exception as e:
        logger.error(f"Error fetching staging: {e}")
        return jsonify({'error': 'Failed to fetch staging'}), 500


@app.route('/api/admin/staging/<int:staging_id>/discard', methods=['POST'])
def admin_discard_staging(staging_id):
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        item = ScanStaging.query.get(staging_id)
        if not item:
            return jsonify({'error': 'Staging item not found'}), 404
        
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error discarding staging: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to discard'}), 500


@app.route('/api/admin/staging/<int:staging_id>/publish', methods=['POST'])
def admin_publish_staging(staging_id):
    password = request.headers.get('X-Admin-Password', '')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if not admin_password or password != admin_password:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        admin_comment = data.get('admin_comment', '').strip()
        
        if not admin_comment:
            return jsonify({'error': 'Admin comment is required'}), 400
        
        item = ScanStaging.query.get(staging_id)
        if not item:
            return jsonify({'error': 'Staging item not found'}), 404
        
        trade_idea = TradeIdea(
            ticker=item.ticker,
            direction=item.direction,
            thesis=admin_comment,
            score=item.score,
            admin_comment=admin_comment,
            active=True
        )
        db.session.add(trade_idea)
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'success': True, 'id': trade_idea.id})
    except Exception as e:
        logger.error(f"Error publishing staging: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to publish'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
