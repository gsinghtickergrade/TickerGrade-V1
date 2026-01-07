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

interface FeedbackItem {
  id: number;
  category: string;
  ticker: string | null;
  message: string;
  contact_email: string | null;
  timestamp: string;
}

interface DailyStat {
  date: string;
  views: number;
  uniques: number;
}

interface TopPage {
  page: string;
  count: number;
}

interface TrafficStats {
  views_24h: number;
  uniques_24h: number;
  daily_stats: DailyStat[];
  top_pages: TopPage[];
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  
  const [newTicker, setNewTicker] = useState('');
  const [newDirection, setNewDirection] = useState('Bullish');
  const [newThesis, setNewThesis] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [editingIdea, setEditingIdea] = useState<TradeIdea | null>(null);
  const [editTicker, setEditTicker] = useState('');
  const [editDirection, setEditDirection] = useState('');
  const [editThesis, setEditThesis] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

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
      fetchFeedback();
      fetchTrafficStats();
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

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const response = await fetch('/api/admin/feedback', {
        headers: { 'X-Admin-Password': password }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFeedback(data.feedback || []);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchTrafficStats = async () => {
    setTrafficLoading(true);
    try {
      const response = await fetch('/api/admin/traffic-stats', {
        headers: { 'X-Admin-Password': password }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTrafficStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch traffic stats:', err);
    } finally {
      setTrafficLoading(false);
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

  const startEdit = (idea: TradeIdea) => {
    setEditingIdea(idea);
    setEditTicker(idea.ticker);
    setEditDirection(idea.direction);
    setEditThesis(idea.thesis);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingIdea(null);
    setEditTicker('');
    setEditDirection('');
    setEditThesis('');
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea) return;
    setEditError(null);
    
    try {
      const response = await fetch(`/api/admin/trade-ideas/${editingIdea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          ticker: editTicker,
          direction: editDirection,
          thesis: editThesis
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update trade idea');
      }
      
      cancelEdit();
      fetchIdeas();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update trade idea');
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
              className="bg-slate-800 border-white/10 text-white placeholder:text-slate-400"
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
      {editingIdea && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="p-6 bg-slate-900 border-white/10 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Trade Idea</h2>
            
            {editError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{editError}</p>
              </div>
            )}
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ticker</label>
                  <Input
                    type="text"
                    value={editTicker}
                    onChange={(e) => setEditTicker(e.target.value.toUpperCase())}
                    className="bg-slate-800 border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Direction</label>
                  <select
                    value={editDirection}
                    onChange={(e) => setEditDirection(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                  value={editThesis}
                  onChange={(e) => setEditThesis(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={cancelEdit} className="border-white/20 text-slate-300 hover:bg-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Trade Ideas Admin</h1>
          <Button
            onClick={() => {
              setAuthenticated(false);
              setPassword('');
              setIdeas([]);
              setFeedback([]);
              setTrafficStats(null);
            }}
            variant="outline"
            className="border-white/20 text-slate-300 hover:bg-white/10"
          >
            Logout
          </Button>
        </div>

        <Card className="p-6 bg-white/5 border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Traffic Command Center</h2>
          
          {trafficLoading && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
          
          {!trafficLoading && trafficStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 text-center">
                  <p className="text-3xl font-bold text-blue-400">{trafficStats.views_24h}</p>
                  <p className="text-sm text-slate-400">Views (24h)</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
                  <p className="text-3xl font-bold text-green-400">{trafficStats.uniques_24h}</p>
                  <p className="text-sm text-slate-400">Unique Visitors (24h)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Last 7 Days</h3>
                  {trafficStats.daily_stats.length === 0 ? (
                    <p className="text-slate-500 text-sm">No traffic data yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 text-slate-400 font-medium">Date</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Views</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Uniques</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trafficStats.daily_stats.map((stat) => (
                            <tr key={stat.date} className="border-b border-white/5">
                              <td className="py-2 text-slate-300">{stat.date}</td>
                              <td className="py-2 text-right text-white">{stat.views}</td>
                              <td className="py-2 text-right text-green-400">{stat.uniques}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Top Pages</h3>
                  {trafficStats.top_pages.length === 0 ? (
                    <p className="text-slate-500 text-sm">No page data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {trafficStats.top_pages.map((page, index) => (
                        <div key={page.page} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                          <span className="text-slate-300 text-sm truncate flex-1">
                            <span className="text-slate-500 mr-2">#{index + 1}</span>
                            {page.page}
                          </span>
                          <span className="text-blue-400 font-medium ml-2">{page.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {!trafficLoading && !trafficStats && (
            <p className="text-slate-500 text-center py-4">Failed to load traffic stats.</p>
          )}
        </Card>

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
                  className="bg-slate-800 border-white/10 text-white placeholder:text-slate-400"
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
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(idea)}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(idea.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="my-8 border-t border-white/10" />

        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">User Feedback Inbox</h2>
          
          {feedbackLoading && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
          
          {!feedbackLoading && feedback.length === 0 && (
            <p className="text-slate-400 text-center py-4">No new feedback reports.</p>
          )}
          
          {!feedbackLoading && feedback.length > 0 && (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.category === 'Bug' ? 'bg-red-500/20 text-red-400' :
                      item.category === 'Feature' ? 'bg-blue-500/20 text-blue-400' :
                      item.category === 'Data Issue' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    {item.ticker && (
                      <span className="text-sm font-bold text-white">{item.ticker}</span>
                    )}
                    <span className="text-xs text-slate-500">{formatDate(item.timestamp)}</span>
                    {item.contact_email && (
                      <a href={`mailto:${item.contact_email}`} className="text-xs text-blue-400 hover:underline">
                        {item.contact_email}
                      </a>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
