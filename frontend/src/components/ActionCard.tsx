'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface ActionCardProps {
  entryZone: number;
  stopLoss: number;
  target: number | null;
  riskReward: number | null;
}

export function ActionCard({ entryZone, stopLoss, target, riskReward }: ActionCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Trade Setup
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <span className="text-slate-400">Entry Zone</span>
          <span className="text-xl font-bold text-blue-400">${entryZone.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
          <span className="text-slate-400">Stop Loss</span>
          <span className="text-xl font-bold text-red-400">${stopLoss.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
          <span className="text-slate-400">Target</span>
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
    </Card>
  );
}
