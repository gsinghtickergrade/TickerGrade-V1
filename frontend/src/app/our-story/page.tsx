'use client';

import React from 'react';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">Our Story</h1>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section className="p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-950/50 border border-blue-500/20">
            <h2 className="text-xl font-semibold text-blue-400 mb-3">1. The Overview: A Rational "Second Opinion"</h2>
            <p>
              TickerGrade is a specialized analytics terminal designed for the self-directed Swing Trader. In a market flooded with "Black Box" AI predictors and noisy alert services, TickerGrade takes a different approach: <strong className="text-white">Evidence-Based Grading.</strong>
            </p>
            <p className="mt-3">
              We do not predict the future. Instead, we rigorously grade the <em>present condition</em> of a stock. Our proprietary algorithm processes real-time data through five distinct pillars—<strong className="text-white">Technical Trend, Relative Value, Fundamental Health, Macro Liquidity, and Event Risks</strong>—to generate a single, unbiased "Confidence Score" (0–10).
            </p>
            <p className="mt-3">
              Think of it as a <strong className="text-white">mariner's pre-departure checklist</strong> for your portfolio: it ensures the conditions are in your favor and the engine is sound before you leave for your next voyage.
            </p>
          </section>

          <section className="p-6 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/50 border border-emerald-500/20">
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">2. The Background: Engineered, Not Hyped</h2>
            <p>
              TickerGrade was born from a simple engineering problem. As a <strong className="text-white">retired senior maritime professional</strong> and active swing trader, our founder realized that most retail tools offer only a slice of the picture. Charting software ignores valuation; fundamental screeners ignore market timing; and almost no one accounts for <strong className="text-white">Net Liquidity</strong> (the Fed's impact on market flow) in their daily scans.
            </p>
            <p className="mt-3">
              To solve this, we built a system that integrates these disconnected datasets into a single, unified view. What started as a private, proprietary tool for personal wealth management has evolved into a commercial-grade platform. We ensure data quality by using professional-grade commercial data feeds, but we present them through a lens of clarity rather than complexity.
            </p>
          </section>

          <section className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-950/50 border border-purple-500/20">
            <h2 className="text-xl font-semibold text-purple-400 mb-3">3. Our Mission: The "Glass Box" Philosophy</h2>
            <p>
              Our mission is to eliminate the "Black Box." Most trading algorithms hide their logic to appear magical. We believe that <strong className="text-white">transparency is the ultimate edge.</strong>
            </p>
            <p className="mt-3">
              When TickerGrade gives a stock a score of "8.5," you can click to see exactly why—down to the specific Moving Average crossover, the PEG ratio, or the Net Liquidity Trend. We do not aim to replace your judgment; we aim to empower it. Our goal is to give you the objective data you need to act with conviction, manage risk without emotion, and trade with the precision of an engineer.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
