'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PillarCardProps {
  title: string;
  score: number;
  weight: number;
  details: Record<string, string | number | boolean | null>;
  icon: React.ReactNode;
}

export function PillarCard({ title, score, weight, details, icon }: PillarCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-blue-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatValue = (key: string, value: string | number | boolean | null) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (key.includes('growth') || key.includes('margin') || key.includes('percent') || key.includes('upside')) {
        return `${value.toFixed(2)}%`;
      }
      if (key.includes('price') || key.includes('sma') || key.includes('target') || key.includes('support')) {
        return `$${value.toFixed(2)}`;
      }
      return value.toFixed(2);
    }
    return value;
  };

  const getEventRiskDisplay = () => {
    if (title !== 'Event Risk') return null;
    
    const pcr = details.put_call_ratio as number | null;
    const pcrSignal = details.pcr_signal as string | null;
    
    if (pcr === null) return null;
    
    let icon = '';
    let statusText = 'Neutral';
    let statusColor = 'text-slate-400';
    
    if (pcrSignal?.includes('Warning')) {
      icon = ' ⚠️';
      statusText = 'High Put Hedging';
      statusColor = 'text-amber-400';
    } else if (pcrSignal?.includes('Greed')) {
      icon = ' 🔥';
      statusText = 'Excessive Calls';
      statusColor = 'text-green-400';
    } else {
      icon = ' ✅';
      statusText = 'Neutral';
      statusColor = 'text-slate-400';
    }
    
    return { pcr, icon, statusText, statusColor };
  };

  const eventRiskDisplay = getEventRiskDisplay();

  const filteredDetails = title === 'Event Risk' 
    ? Object.fromEntries(
        Object.entries(details).filter(([key]) => 
          !['put_call_ratio', 'pcr_signal'].includes(key)
        )
      )
    : details;

  const formatKey = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getValueInsight = () => {
    if (title !== 'Relative Value') return null;
    
    const upsidePercent = details.upside_percent as number | null;
    const valuationSignal = details.valuation_signal as string | null;
    
    if (upsidePercent === null || valuationSignal === null) return null;
    
    if (upsidePercent > 10 && valuationSignal === 'Overvalued') {
      return "Note: Analysts are bullish on price targets, but current fundamentals (PEG) suggest the stock is expensive.";
    }
    
    if (upsidePercent < 0 && valuationSignal === 'Undervalued') {
      return "Note: Fundamentals look cheap, but analysts expect further price drops.";
    }
    
    return null;
  };

  const valueInsight = getValueInsight();

  const getMacroLiquidityDisplay = () => {
    if (title !== 'Macro Liquidity') return null;
    
    const slope = details.net_liquidity_slope as number | null;
    const current = details.net_liquidity_current as number | null;
    
    if (slope === null || current === null || current === 0) return null;
    
    const trendPercent = (slope / current) * 100;
    const isPositive = trendPercent > 0;
    const formattedTrend = `${isPositive ? '+' : ''}${trendPercent.toFixed(2)}%`;
    const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
    
    return { trendPercent, formattedTrend, trendColor };
  };

  const macroLiquidityDisplay = getMacroLiquidityDisplay();

  const filteredMacroDetails = title === 'Macro Liquidity'
    ? Object.fromEntries(
        Object.entries(filteredDetails).filter(([key]) => 
          !['net_liquidity_slope'].includes(key)
        )
      )
    : filteredDetails;

  const displayDetails = title === 'Macro Liquidity' ? filteredMacroDetails : filteredDetails;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="text-sm text-gray-500">Weight: {weight}%</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-gray-400 text-lg">/10</span>
        </div>
        <div className="space-y-2">
          {Object.entries(displayDetails).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-500">{formatKey(key)}</span>
              <span className="font-medium">{formatValue(key, value)}</span>
            </div>
          ))}
          {macroLiquidityDisplay && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Net Liquidity Trend</span>
              <span className={`font-medium ${macroLiquidityDisplay.trendColor}`}>
                {macroLiquidityDisplay.formattedTrend}
              </span>
            </div>
          )}
          {eventRiskDisplay && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Smart Money (PCR)</span>
                <span className="font-medium">{eventRiskDisplay.pcr.toFixed(2)}{eventRiskDisplay.icon}</span>
              </div>
              <div className={`text-xs ${eventRiskDisplay.statusColor} text-right mt-1`}>
                {eventRiskDisplay.statusText}
              </div>
            </div>
          )}
        </div>
        {valueInsight && (
          <p className="mt-3 pt-3 border-t border-white/10 text-xs italic text-amber-400">
            {valueInsight}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
