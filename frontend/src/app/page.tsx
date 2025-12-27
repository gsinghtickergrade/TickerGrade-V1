'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScoreGauge } from '@/components/ScoreGauge';
import { PillarCard } from '@/components/PillarCard';
import { PriceChart } from '@/components/PriceChart';
import { StrategySettings } from '@/components/StrategySettings';

interface StockData {
  ticker: string;
  company_name: string;
  current_price: number;
  final_score: number;
  pillars: {
    fundamentals: {
      score: number;
      weight: number;
      details: Record<string, string | number | null>;
    };
    valuation: {
      score: number;
      weight: number;
      details: Record<string, string | number | null>;
    };
    technicals: {
      score: number;
      weight: number;
      details: Record<string, string | number | null>;
    };
    macro: {
      score: number;
      weight: number;
      details: Record<string, string | number | null>;
    };
  };
  price_history: { date: string; price: number }[];
}

interface Weights {
  fundamentals: number;
  valuation: number;
  technicals: number;
  macro: number;
}

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weights, setWeights] = useState<Weights>({
    fundamentals: 30,
    valuation: 20,
    technicals: 30,
    macro: 20,
  });

  const calculatedScore = useMemo(() => {
    if (!stockData) return 0;
    
    const score = 
      (stockData.pillars.fundamentals.score * weights.fundamentals / 100) +
      (stockData.pillars.valuation.score * weights.valuation / 100) +
      (stockData.pillars.technicals.score * weights.technicals / 100) +
      (stockData.pillars.macro.score * weights.macro / 100);
    
    return Math.round(score * 10) / 10;
  }, [stockData, weights]);

  const analyzeStock = async () => {
    if (!ticker.trim()) {
      setError('Please enter a stock ticker');
      return;
    }

    setLoading(true);
    setError(null);
    setStockData(null);

    try {
      const response = await fetch(`/api/analyze/${ticker.toUpperCase()}`, {
        credentials: 'include',
        redirect: 'manual'
      });

      if (response.type === 'opaqueredirect' || response.status === 0) {
        window.location.href = '/auth/replit_auth';
        return;
      }

      if (response.status === 302 || response.redirected) {
        window.location.href = '/auth/replit_auth';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/auth/replit_auth';
          return;
        }
        throw new Error(data.error || 'Failed to analyze stock');
      }

      setStockData(data);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('Please log in to analyze stocks');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      analyzeStock();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            S&P 500 Stock Scorer
          </h1>
          <p className="text-slate-400 text-lg">
            Get a data-driven Buy/Sell confidence score for any stock
          </p>
        </div>

        <div className="flex gap-4 max-w-xl mx-auto mb-12">
          <Input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL, MSFT, GOOGL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="text-lg h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
          />
          <Button
            onClick={analyzeStock}
            disabled={loading}
            className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {error && (
          <Card className="max-w-xl mx-auto p-6 bg-red-500/10 border-red-500/30 mb-8">
            <p className="text-red-400 text-center">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <StrategySettings weights={weights} onWeightsChange={setWeights} />
          </div>

          <div className="lg:col-span-3">
            {stockData && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-bold text-white">
                        {stockData.company_name}
                      </h2>
                      <p className="text-xl text-slate-400">{stockData.ticker}</p>
                      <p className="text-2xl text-white mt-2">
                        ${stockData.current_price.toFixed(2)}
                      </p>
                    </div>
                    <ScoreGauge score={calculatedScore} />
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <PillarCard
                    title="Fundamentals"
                    score={stockData.pillars.fundamentals.score}
                    weight={weights.fundamentals}
                    details={stockData.pillars.fundamentals.details}
                    icon={
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                  />
                  <PillarCard
                    title="Valuation"
                    score={stockData.pillars.valuation.score}
                    weight={weights.valuation}
                    details={stockData.pillars.valuation.details}
                    icon={
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <PillarCard
                    title="Technicals"
                    score={stockData.pillars.technicals.score}
                    weight={weights.technicals}
                    details={stockData.pillars.technicals.details}
                    icon={
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    }
                  />
                  <PillarCard
                    title="Macro Health"
                    score={stockData.pillars.macro.score}
                    weight={weights.macro}
                    details={stockData.pillars.macro.details}
                    icon={
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                </div>

                <PriceChart data={stockData.price_history} ticker={stockData.ticker} />
              </div>
            )}

            {!stockData && !loading && !error && (
              <div className="text-center text-slate-500 mt-16">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-xl">Enter a stock ticker to get started</p>
                <p className="text-sm mt-2">Try: AAPL, MSFT, GOOGL, AMZN, TSLA</p>
              </div>
            )}
          </div>
        </div>

        {/* About Our Methodology Section */}
        <div className="mt-16 mb-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The TickerGrade Score: Analyzing the Noise, So You Don't Have To.
            </h2>
            <p className="text-slate-400 text-lg max-w-4xl mx-auto leading-relaxed">
              Investing is complex. Between reading balance sheets, analyzing chart patterns, and watching the Fed, it's easy to get lost in the noise. TickerGrade simplifies this chaos into a single, data-driven number. Our algorithm processes real-time financial data through four distinct lenses to provide a holistic 'Buy/Sell Confidence Score' ranging from 0.0 (Strong Sell) to 10.0 (Strong Buy).
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              How We Calculate Your Score
            </h3>
            <p className="text-slate-400 text-center mb-8">
              We don't guess. We weigh four critical pillars of financial health to generate an unbiased rating:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">
                      1. Fundamentals <span className="text-blue-400">(30% Weight)</span>
                    </h4>
                    <p className="text-slate-300 font-medium mb-2">The Health of the Business</p>
                    <p className="text-slate-400">
                      We analyze year-over-year revenue growth and profit margins. A great stock starts with a great company that is actually making money.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">
                      2. Valuation <span className="text-green-400">(20% Weight)</span>
                    </h4>
                    <p className="text-slate-300 font-medium mb-2">The Price You Pay</p>
                    <p className="text-slate-400">
                      A great company isn't a good investment if you overpay. We compare the stock's P/E ratio against its specific sector peers (e.g., Tech vs. Energy) to spot undervalued opportunities.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">
                      3. Technicals <span className="text-purple-400">(30% Weight)</span>
                    </h4>
                    <p className="text-slate-300 font-medium mb-2">The Trend & Momentum</p>
                    <p className="text-slate-400">
                      We look at price action, including the 50-day and 200-day Moving Averages and the Relative Strength Index (RSI), to determine if the stock is being accumulated by institutions or dumped.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">
                      4. Macro Environment <span className="text-orange-400">(20% Weight)</span>
                    </h4>
                    <p className="text-slate-300 font-medium mb-2">The Market Conditions</p>
                    <p className="text-slate-400">
                      Even the best boat can't float in a drained ocean. We factor in the VIX (Volatility Index) and the overall S&P 500 trend to ensure market conditions are safe for entry.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-6">The Verdict</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-24 text-center">
                  <span className="text-green-400 font-bold text-lg">8.0 - 10.0</span>
                </div>
                <div>
                  <span className="text-white font-semibold">Strong Buy</span>
                  <span className="text-slate-400 ml-2">(All systems go)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="w-24 text-center">
                  <span className="text-emerald-400 font-bold text-lg">6.0 - 7.9</span>
                </div>
                <div>
                  <span className="text-white font-semibold">Buy</span>
                  <span className="text-slate-400 ml-2">(Solid, but watch one or two factors)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="w-24 text-center">
                  <span className="text-yellow-400 font-bold text-lg">4.0 - 5.9</span>
                </div>
                <div>
                  <span className="text-white font-semibold">Hold</span>
                  <span className="text-slate-400 ml-2">(Mixed signals)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="w-24 text-center">
                  <span className="text-red-400 font-bold text-lg">0.0 - 3.9</span>
                </div>
                <div>
                  <span className="text-white font-semibold">Avoid / Sell</span>
                  <span className="text-slate-400 ml-2">(Deteriorating conditions)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <p className="text-center text-slate-500 text-sm max-w-3xl mx-auto">
            Information provided by TickerGrade is for educational purposes only and does not constitute financial advice. All scores are algorithmic and based on historical data. Invest at your own risk.
          </p>
        </footer>
      </div>
    </main>
  );
}
