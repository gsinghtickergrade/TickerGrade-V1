'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-white/10">
      <div className="text-center text-slate-500 text-sm pb-8">
        <p>Data provided by MarketData, Finnhub, and FRED. Not financial advice.</p>
        <p className="mt-2">&copy; 2026 TickerGrade LLC. All rights reserved.</p>
      </div>
    </footer>
  );
}
