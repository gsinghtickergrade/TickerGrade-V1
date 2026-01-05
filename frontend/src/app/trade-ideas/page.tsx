'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface TradeIdea {
  id: number;
  ticker: string;
  direction: string;
  thesis: string;
  timestamp: string;
}

export default function TradeIdeasPage() {
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/trade-ideas');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trade ideas');
      }
      
      setIdeas(data.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'Strong Bullish': return { bg: 'bg-[#00C805]/20', text: 'text-[#00C805]', border: 'border-[#00C805]/30' };
      case 'Bullish': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'Neutral': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      case 'Bearish': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
      default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Trade Ideas</h1>
        <p className="text-slate-400 text-center mb-8">
          Curated watchlist from our research team
        </p>

        {loading && (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {error && (
          <Card className="p-6 bg-red-500/10 border-red-500/30 mb-8">
            <p className="text-red-400 text-center mb-4">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchIdeas();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {!loading && !error && ideas.length === 0 && (
          <Card className="p-8 bg-white/5 border-white/10">
            <p className="text-slate-400 text-center">No active trade ideas at the moment. Check back soon.</p>
          </Card>
        )}

        {!loading && !error && ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => {
              const colors = getDirectionColor(idea.direction);
              return (
                <Card key={idea.id} className="p-6 bg-white/5 border-white/10 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white">{idea.ticker}</h3>
                    <span className="text-sm text-slate-500">{formatDate(idea.timestamp)}</span>
                  </div>
                  
                  <p className="text-slate-300 flex-grow mb-4 leading-relaxed">
                    {idea.thesis}
                  </p>
                  
                  <div className="mt-auto">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {idea.direction}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-500 text-sm text-center italic">
            Disclaimer: These ideas represent the founder's personal watchlist and research. They are for educational purposes only and are not recommendations to buy or sell. The founder may hold positions in these securities.
          </p>
        </div>
      </div>
    </div>
  );
}
