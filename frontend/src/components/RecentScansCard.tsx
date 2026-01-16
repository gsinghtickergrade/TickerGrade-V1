'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScanEntry {
  ticker: string;
  score: number;
  price: number;
  timestamp: number;
}

interface RecentScansCardProps {
  scans: ScanEntry[];
  onSelectTicker: (ticker: string) => void;
}

export function RecentScansCard({ scans, onSelectTicker }: RecentScansCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-500';
    if (score >= 6.5) return 'text-blue-500';
    if (score >= 5.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <CardTitle className="text-lg">Recent Scans</CardTitle>
          </div>
          <div className="text-sm text-gray-500">{scans.length}/10</div>
        </div>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent scans</p>
        ) : (
          <div className="space-y-1">
            <div className="flex text-xs text-gray-500 pb-1 border-b border-white/10">
              <span className="flex-1 text-left">Ticker</span>
              <span className="w-14 text-center">Score</span>
              <span className="w-20 text-right">Price</span>
            </div>
            {scans.map((scan) => (
              <button
                key={`${scan.ticker}-${scan.timestamp}`}
                onClick={() => onSelectTicker(scan.ticker)}
                className="w-full flex items-center text-sm py-1.5 hover:bg-white/5 rounded px-1 -mx-1 transition-colors cursor-pointer"
              >
                <span className="flex-1 text-left font-medium text-white">{scan.ticker}</span>
                <span className={`w-14 text-center font-bold ${getScoreColor(scan.score)}`}>
                  {scan.score.toFixed(1)}
                </span>
                <span className="w-20 text-right text-gray-400">
                  ${scan.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
