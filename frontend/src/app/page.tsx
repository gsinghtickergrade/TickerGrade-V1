'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScoreGauge } from '@/components/ScoreGauge';
import { PillarCard } from '@/components/PillarCard';
import { PriceChart } from '@/components/PriceChart';

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

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeStock = async () => {
    if (!ticker.trim()) {
      setError('Please enter a stock ticker');
      return;
    }

    setLoading(true);
    setError(null);
    setStockData(null);

    try {
      const response = await fetch(`/api/analyze/${ticker.toUpperCase()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze stock');
      }

      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
                <ScoreGauge score={stockData.final_score} />
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PillarCard
                title="Fundamentals"
                score={stockData.pillars.fundamentals.score}
                weight={stockData.pillars.fundamentals.weight}
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
                weight={stockData.pillars.valuation.weight}
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
                weight={stockData.pillars.technicals.weight}
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
                weight={stockData.pillars.macro.weight}
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
    </main>
  );
}
