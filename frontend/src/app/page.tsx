'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScoreGauge } from '@/components/ScoreGauge';
import { PillarCard } from '@/components/PillarCard';
import { PriceChart } from '@/components/PriceChart';
import { ActionCard } from '@/components/ActionCard';
import { WelcomeModal } from '@/components/WelcomeModal';
import { CookieBanner } from '@/components/CookieBanner';
import { NetLiquidityChart } from '@/components/NetLiquidityChart';

interface ActionCardData {
  entry_zone: number;
  stop_loss: number;
  target: number | null;
  risk_reward: number | null;
}

interface PillarData {
  score: number;
  weight: number;
  name: string;
  details: Record<string, string | number | boolean | null>;
}

interface StockData {
  ticker: string;
  company_name: string;
  current_price: number;
  final_score: number;
  verdict: string;
  verdict_type: string;
  action_card: ActionCardData;
  pillars: {
    catalysts: PillarData;
    technicals: PillarData;
    value: PillarData;
    macro: PillarData;
    event_risk: PillarData;
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24">
      <WelcomeModal />
      <CookieBanner />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            TickerGrade
          </h1>
          <p className="text-slate-400 text-lg">
            The Decision Engine for 30-60 Day Swing Trades. Catch the trend between earnings.
          </p>
        </div>

        <div className="flex gap-4 max-w-xl mx-auto mb-12">
          <Input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL, MSFT, GOOGL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            onFocus={(e) => e.target.select()}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left flex-1">
                  <h2 className="text-3xl font-bold text-white">
                    {stockData.company_name}
                  </h2>
                  <p className="text-xl text-slate-400">{stockData.ticker}</p>
                  <p className="text-2xl text-white mt-2">
                    ${stockData.current_price.toFixed(2)}
                  </p>
                </div>
                <ScoreGauge score={stockData.final_score} isEarningsBlackout={stockData.pillars.event_risk.details.blackout === true} />
              </div>
            </Card>

            <Card className="p-6 bg-blue-500/10 border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-3">Profit Through Precision</h3>
              <p className="text-slate-300">
                In maritime and industrial operations, safety isn't just about avoiding accidents; it's the foundation of a viable, profitable business. TickerGrade applies this same rigorous risk management to swing trading. By securing the downside first <span className="text-white font-medium">(Capital Preservation)</span>, we clear the path for reliable, sustainable <span className="text-white font-medium">Wealth Growth</span>. We only signal a 'Green Light' when the operational risks are managed and the probability of profit is overwhelmingly in your favor.
              </p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ActionCard 
                  entryZone={stockData.action_card.entry_zone}
                  stopLoss={stockData.action_card.stop_loss}
                  target={stockData.action_card.target}
                  riskReward={stockData.action_card.risk_reward}
                  score={stockData.final_score}
                  isEarningsBlackout={stockData.pillars.event_risk.details.blackout === true}
                />
              </div>
              
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <PillarCard
                    title={stockData.pillars.catalysts.name}
                    score={stockData.pillars.catalysts.score}
                    weight={stockData.pillars.catalysts.weight}
                    details={stockData.pillars.catalysts.details}
                    icon={
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                  />
                  <PillarCard
                    title={stockData.pillars.technicals.name}
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
                    title={stockData.pillars.value.name}
                    score={stockData.pillars.value.score}
                    weight={stockData.pillars.value.weight}
                    details={stockData.pillars.value.details}
                    icon={
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <PillarCard
                    title={stockData.pillars.macro.name}
                    score={stockData.pillars.macro.score}
                    weight={stockData.pillars.macro.weight}
                    details={stockData.pillars.macro.details}
                    icon={
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <PillarCard
                    title={stockData.pillars.event_risk.name}
                    score={stockData.pillars.event_risk.score}
                    weight={stockData.pillars.event_risk.weight}
                    details={stockData.pillars.event_risk.details}
                    icon={
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>

            <PriceChart data={stockData.price_history} ticker={stockData.ticker} />
            
            <NetLiquidityChart />
          </div>
        )}

        {!stockData && !loading && !error && (
          <div className="text-center text-slate-500 mt-16">
            <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-xl">Enter a stock ticker to get started</p>
            <p className="text-sm mt-2">Optimized for 30-60 day swing trades</p>
            
            <div className="mt-12 max-w-2xl mx-auto">
              <Card className="p-6 bg-white/5 border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">New to TickerGrade?</h3>
                <p className="text-slate-400 mb-4">
                  Learn how our 5-pillar scoring system works and how to interpret your results.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/methodology" className="text-blue-400 hover:text-blue-300 font-medium">
                    View Methodology →
                  </Link>
                  <Link href="/guide" className="text-blue-400 hover:text-blue-300 font-medium">
                    Read User Guide →
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
