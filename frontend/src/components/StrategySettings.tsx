'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface Weights {
  fundamentals: number;
  valuation: number;
  technicals: number;
  macro: number;
}

interface StrategySettingsProps {
  weights: Weights;
  onWeightsChange: (updater: (prev: Weights) => Weights) => void;
}

export function StrategySettings({ weights, onWeightsChange }: StrategySettingsProps) {
  const total = weights.fundamentals + weights.valuation + weights.technicals + weights.macro;
  const isValid = total === 100;

  const handleChange = (pillar: keyof Weights, value: number[]) => {
    onWeightsChange((prev) => ({
      ...prev,
      [pillar]: value[0],
    }));
  };

  const sliders = [
    { key: 'fundamentals' as const, label: 'Fundamentals', color: 'bg-blue-500' },
    { key: 'valuation' as const, label: 'Valuation', color: 'bg-green-500' },
    { key: 'technicals' as const, label: 'Technicals', color: 'bg-purple-500' },
    { key: 'macro' as const, label: 'Macro Health', color: 'bg-orange-500' },
  ];

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Strategy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sliders.map(({ key, label, color }) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">{label}</span>
              <span className="text-sm font-semibold text-white">{weights[key]}%</span>
            </div>
            <Slider
              value={[weights[key]]}
              onValueChange={(value) => handleChange(key, value)}
              max={100}
              min={0}
              step={5}
              className={`[&_[role=slider]]:${color}`}
            />
          </div>
        ))}

        <div className={`flex justify-between items-center pt-4 border-t ${isValid ? 'border-white/10' : 'border-red-500/50'}`}>
          <span className="text-sm text-slate-300">Total</span>
          <span className={`text-lg font-bold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
            {total}%
          </span>
        </div>

        {!isValid && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-red-400">
              Weights must add up to 100% (currently {total}%)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
