'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface ActionCardProps {
  entryZone: number;
  stopLoss: number;
  target: number | null;
  riskReward: number | null;
  score: number;
  isEarningsBlackout?: boolean;
}

export function ActionCard({ entryZone, stopLoss, target, riskReward, score, isEarningsBlackout = false }: ActionCardProps) {
  if (isEarningsBlackout) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Hypothetical Risk/Reward
        </h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="p-4 rounded-full bg-yellow-500/20 mb-4">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-yellow-400">Wait (Earnings)</span>
          <p className="text-slate-400 text-center mt-2">Earnings announcement approaching - avoid new positions</p>
        </div>
      </Card>
    );
  }

  if (score < 4) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Hypothetical Risk/Reward
        </h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="p-4 rounded-full bg-red-500/20 mb-4">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-red-400">Avoid / Sell</span>
          <p className="text-slate-400 text-center mt-2">Score too low for a buy setup</p>
        </div>
      </Card>
    );
  }

  if (score < 6) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Hypothetical Risk/Reward
        </h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="p-4 rounded-full bg-yellow-500/20 mb-4">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-yellow-400">On Hold</span>
          <p className="text-slate-400 text-center mt-2">Mixed signals - wait for better setup</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Hypothetical Risk/Reward
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <span className="text-slate-400">Entry Zone</span>
          <span className="text-xl font-bold text-blue-400">${entryZone.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
          <span className="text-slate-400">Support / Invalidation Level</span>
          <span className="text-xl font-bold text-red-400">${stopLoss.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
          <span className="text-slate-400">Resistance / Target Zone</span>
          <span className="text-xl font-bold text-green-400">
            {target ? `$${target.toFixed(2)}` : 'N/A'}
          </span>
        </div>
        
        {riskReward && riskReward > 0 && (
          <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <span className="text-slate-400">Risk/Reward</span>
            <span className="text-xl font-bold text-purple-400">{riskReward.toFixed(2)}:1</span>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-xs text-slate-500 italic">
        Note: These levels are algorithmic projections based on volatility and technical structure. They are for educational risk planning only and not a recommendation to trade.
      </p>
    </Card>
  );
}
