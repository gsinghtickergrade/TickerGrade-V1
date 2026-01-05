'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  isEarningsBlackout?: boolean;
}

export function ScoreGauge({ score, isEarningsBlackout = false }: ScoreGaugeProps) {
  const getColor = (score: number) => {
    if (isEarningsBlackout) return '#eab308';
    if (score >= 8.5) return '#00C805';
    if (score >= 6.5) return '#3B82F6';
    if (score >= 5.0) return '#EAB308';
    return '#EF4444';
  };

  const getLabel = (score: number) => {
    if (isEarningsBlackout) return 'Wait (Earnings)';
    if (score >= 8.5) return 'Strong Bullish';
    if (score >= 6.5) return 'Bullish';
    if (score >= 5.0) return 'Neutral';
    return 'Bearish';
  };

  const percentage = (score / 10) * 100;
  const color = getColor(score);
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48">
        <svg className="w-48 h-48 transform -rotate-[135deg]" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold" style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">/10</span>
        </div>
      </div>
      <div
        className="mt-2 px-4 py-2 rounded-full text-white font-semibold text-lg"
        style={{ backgroundColor: color }}
      >
        {getLabel(score)}
      </div>
    </div>
  );
}
