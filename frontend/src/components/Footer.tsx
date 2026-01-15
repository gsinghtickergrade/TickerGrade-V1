'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 border-t border-white/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center text-slate-400 text-sm space-y-3">
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/legal?tab=terms" 
              className="hover:text-white transition-colors"
            >
              Terms of Use
            </Link>
            <span className="text-slate-600">|</span>
            <Link 
              href="/legal?tab=privacy" 
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <p>Data provided by MarketData, Finnhub, and FRED. Not financial advice.</p>
          <p>&copy; 2026 TickerGrade LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
