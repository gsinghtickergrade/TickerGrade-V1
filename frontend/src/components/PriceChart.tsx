'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PriceData {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  histogram?: number;
  volume?: number;
  volume_sma?: number;
  sma_50?: number;
  sma_200?: number;
}

interface PriceChartProps {
  data: PriceData[];
  ticker: string;
}

export function PriceChart({ data, ticker }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>{ticker} - 1 Year Price History with Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400 text-center py-8">No price data available</div>
        </CardContent>
      </Card>
    );
  }

  const lows = data.map((d) => d.low ?? d.price).filter((p) => p !== undefined);
  const highs = data.map((d) => d.high ?? d.price).filter((p) => p !== undefined);
  const dataMin = lows.length > 0 ? Math.min(...lows) : 0;
  const dataMax = highs.length > 0 ? Math.max(...highs) : 100;
  const priceRange = dataMax - dataMin;
  const minPrice = dataMin - (priceRange * 0.05);
  const maxPrice = dataMax + (priceRange * 0.05);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const hasRsi = data.some(d => d.rsi !== undefined);
  const hasMacd = data.some(d => d.macd !== undefined);
  const hasVolume = data.some(d => d.volume !== undefined);

  const macdValues = data.filter(d => d.macd !== undefined).map(d => d.macd!);
  const signalValues = data.filter(d => d.macd_signal !== undefined).map(d => d.macd_signal!);
  const histogramValues = data.filter(d => d.histogram !== undefined).map(d => d.histogram!);
  const allMacdValues = [...macdValues, ...signalValues, ...histogramValues];
  const macdMin = allMacdValues.length > 0 ? Math.min(...allMacdValues) * 1.1 : -5;
  const macdMax = allMacdValues.length > 0 ? Math.max(...allMacdValues) * 1.1 : 5;

  const volumeValues = data.filter(d => d.volume !== undefined).map(d => d.volume!);
  const maxVolume = volumeValues.length > 0 ? Math.max(...volumeValues) * 1.1 : 1000000;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>{ticker} - 1 Year Price History with Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="h-64 w-full">
          <div className="text-xs text-slate-400 mb-1 font-medium">Price</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval="preserveStartEnd"
                stroke="#4b5563"
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                stroke="#4b5563"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number | undefined, name?: string) => {
                  const label = name === 'sma_50' ? '50d Trend' : name === 'sma_200' ? '200d Major' : 'Price';
                  return [value !== undefined ? `$${value.toFixed(2)}` : '$0.00', label];
                }}
                labelFormatter={formatDate}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name="Price"
              />
              <Line
                type="monotone"
                dataKey="sma_50"
                stroke="#00C805"
                strokeWidth={2}
                dot={false}
                name="50d Trend"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="sma_200"
                stroke="#FF8800"
                strokeWidth={2}
                dot={false}
                name="200d Major"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {hasRsi && (
          <div className="h-28 w-full">
            <div className="text-xs text-slate-400 mb-1 font-medium">RSI (14)</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                  stroke="#4b5563"
                  hide
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[30, 50, 70]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  stroke="#4b5563"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value: number | undefined) => [value !== undefined ? value.toFixed(2) : '0', 'RSI']}
                  labelFormatter={formatDate}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '70', fontSize: 10, fill: '#ef4444', position: 'right' }} />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label={{ value: '30', fontSize: 10, fill: '#22c55e', position: 'right' }} />
                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {hasMacd && (
          <div className="h-28 w-full">
            <div className="text-xs text-slate-400 mb-1 font-medium">MACD (12,26,9)</div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                  stroke="#4b5563"
                  hide
                />
                <YAxis
                  domain={[macdMin, macdMax]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  stroke="#4b5563"
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value: number | undefined, name?: string) => {
                    const label = name === 'macd' ? 'MACD' : name === 'macd_signal' ? 'Signal' : 'Histogram';
                    return [value !== undefined ? value.toFixed(4) : '0', label];
                  }}
                  labelFormatter={formatDate}
                />
                <ReferenceLine y={0} stroke="#6b7280" />
                <Bar dataKey="histogram" name="histogram">
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.histogram !== undefined && entry.histogram >= 0 ? '#22c55e' : '#ef4444'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="macd"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="macd_signal"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {hasVolume && (
          <div className="h-24 w-full">
            <div className="text-xs text-slate-400 mb-1 font-medium">Volume</div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                  stroke="#4b5563"
                />
                <YAxis
                  domain={[0, maxVolume]}
                  tickFormatter={formatVolume}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  stroke="#4b5563"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value: number | undefined, name?: string) => {
                    const label = name === 'volume' ? 'Volume' : '20-day SMA';
                    return [value !== undefined ? formatVolume(value) : '0', label];
                  }}
                  labelFormatter={formatDate}
                />
                <Bar dataKey="volume" name="volume">
                  {data.map((entry, index) => {
                    const isGreen = entry.open !== undefined && entry.price > entry.open;
                    return (
                      <Cell
                        key={`vol-${index}`}
                        fill={isGreen ? '#22c55e' : '#ef4444'}
                        fillOpacity={0.6}
                      />
                    );
                  })}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="volume_sma"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="volume_sma"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span>Price</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: '#00C805' }}></div>
            <span>50d Trend</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: '#FF8800' }}></div>
            <span>200d Major</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-500"></div>
            <span>RSI</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-orange-500"></div>
            <span>Signal Line</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 opacity-70"></div>
            <span>Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 opacity-70"></div>
            <span>Bearish</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
