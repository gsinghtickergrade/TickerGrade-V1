from flask import Flask, jsonify, request, session, redirect, url_for, render_template
from flask_cors import CORS
from flask_login import current_user
from werkzeug.middleware.proxy_fix import ProxyFix
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import logging

logging.basicConfig(level=logging.DEBUG)

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
    logging.info("Database tables created")

@app.before_request
def make_session_permanent():
    session.permanent = True

SECTOR_AVG_PE = {
    'Technology': 25,
    'Consumer Cyclical': 20,
    'Healthcare': 18,
    'Financial Services': 15,
    'Consumer Defensive': 22,
    'Industrials': 18,
    'Energy': 10,
    'Basic Materials': 15,
    'Real Estate': 20,
    'Utilities': 16,
    'Communication Services': 20,
}

def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1] if not rsi.empty else 50

def calculate_sma(prices, period):
    return prices.rolling(window=period).mean().iloc[-1] if len(prices) >= period else None

def get_fundamentals_score(info):
    score = 0
    max_score = 10
    details = {}
    
    revenue_growth = info.get('revenueGrowth', 0) or 0
    details['revenue_growth'] = round(revenue_growth * 100, 2)
    
    profit_margin = info.get('profitMargins', 0) or 0
    details['profit_margin'] = round(profit_margin * 100, 2)
    
    if revenue_growth > 0.10:
        score += 5
    elif revenue_growth > 0.05:
        score += 3
    elif revenue_growth > 0:
        score += 1
    
    if profit_margin > 0.15:
        score += 5
    elif profit_margin > 0.10:
        score += 3
    elif profit_margin > 0:
        score += 1
    
    return min(score, max_score), details

def get_valuation_score(info):
    score = 0
    max_score = 10
    details = {}
    
    pe_ratio = info.get('forwardPE') or info.get('trailingPE', 0) or 0
    sector = info.get('sector', 'Technology')
    sector_avg = SECTOR_AVG_PE.get(sector, 20)
    
    details['pe_ratio'] = round(pe_ratio, 2) if pe_ratio else None
    details['sector'] = sector
    details['sector_avg_pe'] = sector_avg
    
    if pe_ratio and pe_ratio > 0:
        if pe_ratio < sector_avg * 0.7:
            score = 10
        elif pe_ratio < sector_avg * 0.9:
            score = 8
        elif pe_ratio < sector_avg:
            score = 6
        elif pe_ratio < sector_avg * 1.2:
            score = 4
        else:
            score = 2
    
    return min(score, max_score), details

def get_technicals_score(hist, current_price):
    score = 0
    max_score = 10
    details = {}
    
    if hist.empty or len(hist) < 50:
        return 5, {'sma_50': None, 'sma_200': None, 'rsi': None, 'current_price': current_price}
    
    close_prices = hist['Close']
    sma_50 = calculate_sma(close_prices, 50)
    sma_200 = calculate_sma(close_prices, 200) if len(hist) >= 200 else None
    rsi = calculate_rsi(close_prices)
    
    details['sma_50'] = round(sma_50, 2) if sma_50 else None
    details['sma_200'] = round(sma_200, 2) if sma_200 else None
    details['rsi'] = round(rsi, 2) if rsi else None
    details['current_price'] = round(current_price, 2) if current_price else None
    
    if sma_50 and current_price > sma_50:
        score += 3
    if sma_200 and current_price > sma_200:
        score += 2
    
    if rsi:
        if rsi < 30:
            score += 5
        elif rsi < 40:
            score += 3
        elif rsi < 60:
            score += 2
        elif rsi > 70:
            score += 0
    
    return min(score, max_score), details

def get_macro_score():
    score = 0
    max_score = 10
    details = {}
    
    try:
        vix = yf.Ticker('^VIX')
        vix_hist = vix.history(period='5d')
        vix_value = vix_hist['Close'].iloc[-1] if not vix_hist.empty else 20
        details['vix'] = round(vix_value, 2)
        
        if vix_value < 15:
            score += 5
        elif vix_value < 20:
            score += 4
        elif vix_value < 25:
            score += 2
        else:
            score += 0
    except:
        details['vix'] = None
        score += 2
    
    try:
        spy = yf.Ticker('SPY')
        spy_hist = spy.history(period='1y')
        if not spy_hist.empty and len(spy_hist) >= 200:
            spy_price = spy_hist['Close'].iloc[-1]
            spy_sma_200 = calculate_sma(spy_hist['Close'], 200)
            details['spy_price'] = round(spy_price, 2)
            details['spy_sma_200'] = round(spy_sma_200, 2) if spy_sma_200 else None
            
            if spy_sma_200 and spy_price > spy_sma_200:
                score += 5
            elif spy_sma_200 and spy_price > spy_sma_200 * 0.95:
                score += 3
            else:
                score += 1
        else:
            details['spy_price'] = None
            details['spy_sma_200'] = None
            score += 2
    except:
        details['spy_price'] = None
        details['spy_sma_200'] = None
        score += 2
    
    return min(score, max_score), details

def calculate_final_score(fundamentals, valuation, technicals, macro):
    weights = {
        'fundamentals': 0.30,
        'valuation': 0.20,
        'technicals': 0.30,
        'macro': 0.20
    }
    
    final_score = (
        fundamentals * weights['fundamentals'] +
        valuation * weights['valuation'] +
        technicals * weights['technicals'] +
        macro * weights['macro']
    )
    
    return round(final_score, 1)

@app.route('/api/analyze/<ticker>', methods=['GET'])
@require_login
def analyze_stock(ticker):
    try:
        ticker = ticker.upper()
        stock = yf.Ticker(ticker)
        
        info = stock.info
        if not info or 'symbol' not in info:
            return jsonify({'error': 'Invalid ticker symbol'}), 404
        
        hist = stock.history(period='1y')
        if hist.empty:
            return jsonify({'error': 'No historical data available'}), 404
        
        current_price = hist['Close'].iloc[-1] if not hist.empty else 0
        
        fundamentals_score, fundamentals_details = get_fundamentals_score(info)
        valuation_score, valuation_details = get_valuation_score(info)
        technicals_score, technicals_details = get_technicals_score(hist, current_price)
        macro_score, macro_details = get_macro_score()
        
        final_score = calculate_final_score(
            fundamentals_score, valuation_score, technicals_score, macro_score
        )
        
        price_history = []
        for date, row in hist.iterrows():
            price_history.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(row['Close'], 2)
            })
        
        return jsonify({
            'ticker': ticker,
            'company_name': info.get('longName', ticker),
            'current_price': round(current_price, 2),
            'final_score': final_score,
            'pillars': {
                'fundamentals': {
                    'score': fundamentals_score,
                    'weight': 30,
                    'details': fundamentals_details
                },
                'valuation': {
                    'score': valuation_score,
                    'weight': 20,
                    'details': valuation_details
                },
                'technicals': {
                    'score': technicals_score,
                    'weight': 30,
                    'details': technicals_details
                },
                'macro': {
                    'score': macro_score,
                    'weight': 20,
                    'details': macro_details
                }
            },
            'price_history': price_history
        })
    
    except Exception as e:
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
    return jsonify({'status': 'healthy', 'service': 'S&P 500 Stock Scorer API'})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
