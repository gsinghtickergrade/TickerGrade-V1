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
    if (score >= 7) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
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

  const formatKey = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

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
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-500">{formatKey(key)}</span>
              <span className="font-medium">{formatValue(key, value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
