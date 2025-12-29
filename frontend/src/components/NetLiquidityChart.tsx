'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LiquidityData {
  date: string;
  net_liquidity: number;
  net_liquidity_norm: number;
  spy_price?: number;
  spy_norm?: number;
}

interface ApiResponse {
  data: LiquidityData[];
  current_net_liquidity: number;
  credit_spread: number;
}

export function NetLiquidityChart() {
  const [data, setData] = useState<LiquidityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLiquidity, setCurrentLiquidity] = useState<number | null>(null);
  const [creditSpread, setCreditSpread] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/macro/net-liquidity');

      if (!response.ok) {
        throw new Error('Failed to fetch liquidity data');
      }

      const result: ApiResponse = await response.json();
      setData(result.data);
      setCurrentLiquidity(result.current_net_liquidity);
      setCreditSpread(result.credit_spread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="text-center text-slate-400 py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading Fed Net Liquidity data...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="text-center text-slate-400 py-8">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Fed Net Liquidity vs S&P 500
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Net Liquidity = Fed Balance Sheet - Treasury General Account - Reverse Repo
          </p>
        </div>
        <div className="text-right">
          {currentLiquidity && (
            <div className="text-sm text-slate-400">
              Current: <span className="text-white font-semibold">${currentLiquidity}T</span>
            </div>
          )}
          {creditSpread && (
            <div className="text-sm text-slate-400">
              Credit Spread: <span className={creditSpread > 4 ? 'text-red-400' : 'text-green-400'}>{creditSpread}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              yAxisId="left"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: 'Normalized %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F1F5F9' }}
              itemStyle={{ color: '#F1F5F9' }}
              formatter={(value: number | undefined, name: string | undefined) => [
                value !== undefined ? `${value.toFixed(1)}%` : 'N/A',
                name === 'net_liquidity_norm' ? 'Net Liquidity' : 'S&P 500'
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
              formatter={(value) => value === 'net_liquidity_norm' ? 'Net Liquidity' : 'S&P 500'}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="net_liquidity_norm" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="spy_norm" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
