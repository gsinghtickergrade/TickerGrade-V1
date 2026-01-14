import logging
from datetime import datetime, date
from models import db, Watchlist, ScanStaging

logger = logging.getLogger(__name__)


def get_direction_from_score(score: float) -> str:
    if score >= 8.5:
        return 'Strong Bullish'
    elif score >= 6.5:
        return 'Bullish'
    elif score >= 5.0:
        return 'Neutral'
    else:
        return 'Bearish'


def run_scanner(analyze_func, category=None):
    results = {
        'scanned': 0,
        'bullish': 0,
        'bearish': 0,
        'errors': []
    }
    
    base_query = Watchlist.query.filter(~Watchlist.ticker.startswith('_PLACEHOLDER_'))
    
    if category:
        tickers = base_query.filter_by(category=category).all()
        logger.info(f"Scanning category '{category}' with {len(tickers)} tickers")
    else:
        tickers = base_query.all()
        logger.info(f"Scanning all categories with {len(tickers)} tickers")
    
    if not tickers:
        logger.info("No tickers in watchlist")
        return results
    
    today = date.today()
    
    for item in tickers:
        ticker = item.ticker.upper()
        try:
            analysis = analyze_func(ticker)
            
            if not analysis or 'error' in analysis:
                error_msg = analysis.get('error', 'Unknown error') if analysis else 'No response'
                results['errors'].append(f"{ticker}: {error_msg}")
                continue
            
            score = analysis.get('total_score', 0)
            results['scanned'] += 1
            
            if score >= 8.0 or score <= 5.0:
                direction = get_direction_from_score(score)
                
                existing = ScanStaging.query.filter(
                    ScanStaging.ticker == ticker,
                    db.func.date(ScanStaging.scanned_at) == today
                ).first()
                
                if existing:
                    existing.score = score
                    existing.direction = direction
                    existing.scanned_at = datetime.utcnow()
                else:
                    staging = ScanStaging(
                        ticker=ticker,
                        score=score,
                        direction=direction
                    )
                    db.session.add(staging)
                
                if score >= 8.0:
                    results['bullish'] += 1
                else:
                    results['bearish'] += 1
            
            db.session.commit()
            
        except Exception as e:
            logger.error(f"Scanner error for {ticker}: {e}")
            results['errors'].append(f"{ticker}: {str(e)}")
            db.session.rollback()
    
    return results
