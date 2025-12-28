from flask import Flask, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from flask_login import current_user
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import logging

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
app.secret_key = os.environ.get("SESSION_SECRET")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
CORS(app, supports_credentials=True)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    'pool_pre_ping': True,
    "pool_recycle": 300,
}

from models import db
db.init_app(app)

from replit_auth import init_login_manager, make_replit_blueprint, require_login

init_login_manager(app)
app.register_blueprint(make_replit_blueprint(), url_prefix="/auth")

with app.app_context():
    db.create_all()
    logger.info("Database tables created")

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.route('/api/analyze/<ticker>', methods=['GET'])
@require_login
def analyze_stock(ticker):
    try:
        ticker = ticker.upper()
        
        quote = get_stock_quote(ticker)
        if not quote:
            return jsonify({'error': 'Invalid ticker symbol or no data available'}), 404
        
        profile = get_stock_profile(ticker)
        hist_df = get_historical_prices(ticker, days=120)
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
            for _, row in hist_df.iterrows():
                price_history.append({
                    'date': row['date'].strftime('%Y-%m-%d') if hasattr(row['date'], 'strftime') else str(row['date'])[:10],
                    'price': round(row['close'], 2)
                })
        
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
@require_login
def get_net_liquidity():
    try:
        fred_df = get_fred_data()
        spy_df = get_spy_data()
        
        if fred_df is None:
            return jsonify({'error': 'Unable to fetch FRED data'}), 500
        
        liq_min = fred_df['net_liquidity'].min()
        liq_max = fred_df['net_liquidity'].max()
        fred_df['net_liquidity_norm'] = (fred_df['net_liquidity'] - liq_min) / (liq_max - liq_min) * 100
        
        data = []
        for date, row in fred_df.iterrows():
            entry = {
                'date': date.strftime('%Y-%m-%d'),
                'net_liquidity': round(row['net_liquidity'] / 1000000, 2),
                'net_liquidity_norm': round(row['net_liquidity_norm'], 2)
            }
            
            if spy_df is not None and date in spy_df.index:
                entry['spy_price'] = round(spy_df.loc[date, 'close'], 2)
            
            data.append(entry)
        
        if spy_df is not None:
            spy_min = spy_df['close'].min()
            spy_max = spy_df['close'].max()
            for entry in data:
                if 'spy_price' in entry:
                    entry['spy_norm'] = round((entry['spy_price'] - spy_min) / (spy_max - spy_min) * 100, 2)
        
        return jsonify({
            'data': data[-90:],
            'current_net_liquidity': round(fred_df['net_liquidity'].iloc[-1] / 1000000, 2),
            'credit_spread': round(fred_df['credit_spreads'].iloc[-1], 2)
        })
    
    except Exception as e:
        logger.error(f"Error fetching net liquidity: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'profile_image_url': current_user.profile_image_url
            }
        })
    return jsonify({'authenticated': False})

@app.route('/', methods=['GET'])
def root_health_check():
    return jsonify({'status': 'healthy', 'service': 'Swing Trading Decision Engine API'})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
