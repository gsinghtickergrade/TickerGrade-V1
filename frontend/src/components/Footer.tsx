'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-white/10">
      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <Link href="/legal" className="text-slate-400 hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <Link href="/legal" className="text-slate-400 hover:text-white transition-colors">
          Terms of Service
        </Link>
        <Link href="/legal" className="text-slate-400 hover:text-white transition-colors">
          Disclaimer
        </Link>
      </div>
      <div className="text-center text-slate-500 text-sm pb-8">
        <p>Data provided by MarketData, Finnhub, FRED, and Yahoo Finance. Not financial advice.</p>
        <p className="mt-2">© 2026 TickerGrade LLC. All rights reserved.</p>
      </div>
    </footer>
  );
}
