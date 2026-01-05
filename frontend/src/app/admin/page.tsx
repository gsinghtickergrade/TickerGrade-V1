'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TradeIdea {
  id: number;
  ticker: string;
  direction: string;
  thesis: string;
  timestamp: string;
  active: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [newTicker, setNewTicker] = useState('');
  const [newDirection, setNewDirection] = useState('Bullish');
  const [newThesis, setNewThesis] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      setAuthenticated(true);
      fetchIdeas();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/trade-ideas', {
        headers: { 'X-Admin-Password': password }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIdeas(data.ideas);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const response = await fetch('/api/admin/trade-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ticker: newTicker,
          direction: newDirection,
          thesis: newThesis
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trade idea');
      }
      
      setSubmitSuccess(true);
      setNewTicker('');
      setNewThesis('');
      setNewDirection('Bullish');
      fetchIdeas();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create trade idea');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trade idea?')) return;
    
    try {
      const response = await fetch(`/api/admin/trade-ideas/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': password }
      });
      
      if (response.ok) {
        fetchIdeas();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-24 pb-12 flex items-center justify-center">
        <Card className="p-8 bg-white/5 border-white/10 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>
          
          {authError && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-center text-sm">{authError}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-white/10"
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">Trade Ideas Admin</h1>

        <Card className="p-6 bg-white/5 border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Trade Idea</h2>
          
          {submitError && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}
          
          {submitSuccess && (
            <div className="p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">Trade idea added successfully!</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ticker</label>
                <Input
                  type="text"
                  placeholder="e.g., NVDA"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  className="bg-slate-800 border-white/10"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Direction</label>
                <select
                  value={newDirection}
                  onChange={(e) => setNewDirection(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Strong Bullish">Strong Bullish</option>
                  <option value="Bullish">Bullish</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Bearish">Bearish</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Thesis</label>
              <textarea
                placeholder="Enter your analysis and reasoning..."
                value={newThesis}
                onChange={(e) => setNewThesis(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
            
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Trade Idea
            </Button>
          </form>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Existing Trade Ideas</h2>
          
          {loading && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
          
          {!loading && ideas.length === 0 && (
            <p className="text-slate-400 text-center py-4">No trade ideas yet.</p>
          )}
          
          {!loading && ideas.length > 0 && (
            <div className="space-y-4">
              {ideas.map((idea) => (
                <div key={idea.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-white">{idea.ticker}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        idea.direction === 'Strong Bullish' ? 'bg-[#00C805]/20 text-[#00C805]' :
                        idea.direction === 'Bullish' ? 'bg-blue-500/20 text-blue-400' :
                        idea.direction === 'Neutral' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {idea.direction}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(idea.timestamp)}</span>
                      {!idea.active && (
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-600/50 text-slate-400">Inactive</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{idea.thesis}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(idea.id)}
                    className="shrink-0"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
