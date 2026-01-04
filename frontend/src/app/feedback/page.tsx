'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FeedbackPage() {
  const [category, setCategory] = useState('Bug');
  const [ticker, setTicker] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter your observation');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          ticker: ticker.trim(),
          contact_email: email.trim(),
          message: message.trim()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }
      
      setSuccess(true);
      setCategory('Bug');
      setTicker('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Feedback & Observations</h1>
        <p className="text-slate-400 text-center mb-8">
          TickerGrade is in Beta trials. Your detailed reports help us calibrate the system.
        </p>

        {success && (
          <Card className="p-4 mb-6 bg-green-500/10 border-green-500/30">
            <p className="text-green-400 text-center font-medium">
              Report received. Thank you for helping us improve.
            </p>
          </Card>
        )}

        {error && (
          <Card className="p-4 mb-6 bg-red-500/10 border-red-500/30">
            <p className="text-red-400 text-center">{error}</p>
          </Card>
        )}

        <Card className="p-6 bg-white/5 border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bug">Bug</option>
                <option value="Data Error">Data Error</option>
                <option value="Feature">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Related Ticker (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., NVDA"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="bg-slate-800 border-white/10"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Email (Optional, for follow-up)
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Observation <span className="text-red-400">*</span>
              </label>
              <textarea
                placeholder="Describe what you observed, expected behavior, and any steps to reproduce..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Report'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
