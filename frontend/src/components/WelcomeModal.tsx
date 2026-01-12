'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('terms_accepted');
    if (hasAccepted !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('terms_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="max-w-lg mx-4 p-8 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Disclaimer & Terms</h2>
        </div>
        
        <div className="text-slate-300 mb-8">
          <p className="text-center leading-relaxed">
            TickerGrade is a free research tool for educational purposes only. We are not financial advisors. By entering, you agree that you are solely responsible for your trades. Data is provided by{' '}
            <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Finnhub</a>,{' '}
            <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">FRED</a>, and{' '}
            <a href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Yahoo Finance</a>.
          </p>
        </div>
        
        <Button 
          onClick={handleAccept}
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
        >
          I Understand & Agree
        </Button>
      </div>
    </div>
  );
}
