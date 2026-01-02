'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">How to Read Your Score</h1>
          <p className="text-slate-400 text-lg">
            TickerGrade is a decision engine, not a crystal ball.
          </p>
        </div>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-green-500/10 border-green-500/30">
              <h2 className="text-xl font-bold text-green-400 mb-4">Who is TickerGrade for?</h2>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><span className="text-white font-medium">The Recovering Hype-Chaser:</span> You're tired of alerts that promise the moon and deliver losses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><span className="text-white font-medium">The Part-Time Trader:</span> You have a career and can't watch the 1-minute chart. You want 30-60 day trends.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><span className="text-white font-medium">The Systems Thinker:</span> You prefer checklists, data, and probability over 'gut feelings' and 'hot tips'.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-red-500/10 border-red-500/30">
              <h2 className="text-xl font-bold text-red-400 mb-4">Who is this NOT for?</h2>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Day Traders seeking adrenaline.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Investors looking for a 10-year hold.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Traders who ignore macro risks.</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">The Scoreboard</h2>
          <div className="space-y-4">
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-start gap-4">
                <span className="px-4 py-2 rounded-lg text-lg font-bold bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">
                  8.0 - 10.0
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white">Strong Buy</h3>
                  <p className="text-slate-400 mt-1">
                    All systems go. Macro, Technicals, and Fundamentals align. This is the highest-conviction setup—consider it a green light for your trade.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-start gap-4">
                <span className="px-4 py-2 rounded-lg text-lg font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">
                  6.0 - 7.9
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white">Buy</h3>
                  <p className="text-slate-400 mt-1">
                    Solid setup, but check for specific warnings. One or two pillars may be neutral. Still actionable, but size your position accordingly.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-start gap-4">
                <span className="px-4 py-2 rounded-lg text-lg font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 whitespace-nowrap">
                  4.0 - 5.9
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white">Hold</h3>
                  <p className="text-slate-400 mt-1">
                    Mixed signals. Usually means "Good Company, Bad Timing." Wait for the setup to improve before committing capital.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-start gap-4">
                <span className="px-4 py-2 rounded-lg text-lg font-bold bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                  0.0 - 3.9
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white">Avoid/Sell</h3>
                  <p className="text-slate-400 mt-1">
                    Deteriorating conditions. Capital preservation mode. The risk/reward is not in your favor—stay on the sidelines or sell.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Critical Safety Features</h2>
          <div className="space-y-6">
            <Card className="p-6 bg-amber-500/10 border-amber-500/30">
              <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why is the Trade Setup hidden?
              </h3>
              <p className="text-slate-300">
                If a stock scores below 6.0, we deliberately hide the Entry, Stop Loss, and Target prices. This prevents you from "forcing" a trade on a weak setup. Our philosophy: <span className="text-white font-medium">No trade is better than a bad trade.</span>
              </p>
            </Card>

            <Card className="p-6 bg-red-500/10 border-red-500/30">
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                What is 'Event Risk'?
              </h3>
              <p className="text-slate-300">
                We run a dual-layer safety check:
              </p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  <span><span className="text-white font-medium">Earnings Blackout:</span> If the next earnings report is less than 15 days away, we lock the score to "Wait" to protect you from binary volatility events.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  <span><span className="text-white font-medium">Put/Call Ratio:</span> If the options market shows a PCR &gt; 2.0 (institutions aggressively hedging), we penalize the score even if the chart looks perfect.</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 bg-white/5 border-white/10">
              <h3 className="text-white font-semibold mb-2">Check the Pillars</h3>
              <p className="text-slate-400 text-sm">
                A score of 7.0 could mean different things. Look at individual pillar scores to understand where the strength or weakness lies.
              </p>
            </Card>
            <Card className="p-5 bg-white/5 border-white/10">
              <h3 className="text-white font-semibold mb-2">Respect the Macro</h3>
              <p className="text-slate-400 text-sm">
                If the Macro Liquidity pillar is red, even strong technical setups can fail. The tide affects all boats.
              </p>
            </Card>
            <Card className="p-5 bg-white/5 border-white/10">
              <h3 className="text-white font-semibold mb-2">Use the Stop Loss</h3>
              <p className="text-slate-400 text-sm">
                Our ATR-based stop losses give you breathing room while protecting capital. Never ignore them.
              </p>
            </Card>
            <Card className="p-5 bg-white/5 border-white/10">
              <h3 className="text-white font-semibold mb-2">Time Your Entry</h3>
              <p className="text-slate-400 text-sm">
                The 30-60 day timeframe is optimal for catching inter-quarter trends. Don't rush—wait for alignment.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
