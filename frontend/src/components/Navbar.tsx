'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            TickerGrade
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              About
            </Link>
            <Link 
              href="/methodology" 
              className={`text-sm font-medium transition-colors ${
                isActive('/methodology') 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Methodology
            </Link>
            <Link 
              href="/guide" 
              className={`text-sm font-medium transition-colors ${
                isActive('/guide') 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              User Guide
            </Link>
            <Link 
              href="/feedback" 
              className={`text-sm font-medium transition-colors ${
                isActive('/feedback') 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Feedback
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
