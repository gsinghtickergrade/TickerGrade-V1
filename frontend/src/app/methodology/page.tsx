'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <Card className="p-8 bg-blue-500/10 border-blue-500/30 mb-12">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Our Philosophy: Profit Through Precision</h2>
          <p className="text-blue-200 leading-relaxed mb-4">
            In maritime and industrial operations, safety isn't just about avoiding accidents; it's the foundation of a viable, profitable business. TickerGrade applies this same rigorous risk management to swing trading.
          </p>
          <p className="text-blue-200 leading-relaxed">
            We identify hazards—from shifting Macro tides to hidden volatility—and apply algorithmic safeguards to mitigate them as far as possible. By securing the downside first <span className="font-semibold text-white">(Capital Preservation)</span>, we clear the path for reliable, sustainable <span className="font-semibold text-white">Wealth Growth</span>. We only signal a 'Green Light' when the operational risks are managed and the probability of profit is overwhelmingly in your favor.
          </p>
        </Card>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Inside the TickerGrade Engine</h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            The technical manual for understanding our 5-pillar scoring system. Each pillar is weighted based on its predictive power for 30-60 day swing trades.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Catalysts & Sentiment</h2>
                <span className="text-yellow-400 font-semibold">20% Weight</span>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              Stocks don't move without a spark. We track real-time Analyst Upgrades, Downgrades and News Sentiment to spot when the narrative is shifting from bearish to bullish or vice-versa before the price catches up.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Analyst Activity:</span> Fetches grades from the last 30 days. Compares new vs previous grade to detect upgrades/downgrades.
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">News Sentiment:</span> TextBlob analyzes sentiment polarity on article titles, averaging scores across recent news.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Technical Structure</h2>
                <span className="text-purple-400 font-semibold">35% Weight</span>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              Precision matters. We go beyond basic charts by tracking RSI Divergence to spot trend reversals before they happen. We combine this with MACD and Volume Analysis to identify high-probability entry points.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">RSI Divergence:</span> Bullish = Price Lower Low + RSI Higher Low. Bearish = Price Higher High + RSI Lower High.
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">MACD (12,26,9):</span> Golden Cross = +2.5, Death Cross = -2.0. Uses absolute dollar calculation.
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Volume:</span> Bullish if Volume &gt; 20-Day SMA on green days.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-green-500/20">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Relative Value</h2>
                <span className="text-green-400 font-semibold">15% Weight</span>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              Price is what you pay; value is what you get. We compare the stock's PEG Ratio and Analyst Price Targets to ensure you have enough 'upside room' to justify the risk.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">PEG Ratio:</span> &lt;1.0 = Bullish (Undervalued Growth), 1.0-2.0 = Neutral, &gt;2.0 = Bearish (Overvalued).
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Fallback:</span> Uses P/S Ratio when PEG is unavailable.
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Price Targets:</span> Upside percentage calculated from analyst consensus.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Macro Liquidity</h2>
                <span className="text-blue-400 font-semibold">20% Weight</span>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              Even the best ship sinks in a hurricane. We connect directly to the Federal Reserve (FRED) database to track 'Net Liquidity' and Credit Spreads. If the macro environment is toxic, our engine forces a defensive score.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Fed Net Liquidity:</span> WALCL - WTREGEN - RRPONTSYD
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Credit Spreads:</span> High-yield spreads &gt;4% or rising = bearish environment.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-red-500/20">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Event Risk</h2>
                <span className="text-red-400 font-semibold">10% Weight</span>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              We hate surprises. The system runs a dual-layer safety check to protect you from binary volatility events.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Calendar Risk:</span> If earnings are due within 15 days, we lock the score to 'Wait'.
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Smart Money Fear Gauge:</span> Real-time Put/Call Ratio from options market. PCR &gt;2.0 triggers a warning.
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Data Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white/5 border-white/10 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Company & Calendar</h3>
              <a href="https://financialmodelingprep.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                Financial Modeling Prep (FMP)
              </a>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Macro Economics</h3>
              <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                Federal Reserve (FRED)
              </a>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Options Sentiment</h3>
              <a href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                Yahoo Finance
              </a>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
