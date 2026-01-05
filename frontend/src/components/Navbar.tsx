'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => pathname === path;
  
  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/about', label: 'About' },
    { href: '/methodology', label: 'Methodology' },
    { href: '/guide', label: 'User Guide' },
    { href: '/trade-ideas', label: 'Trade Ideas' },
    { href: '/feedback', label: 'Feedback' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            TickerGrade
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href) 
                    ? 'text-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-white/10">
          <div className="container mx-auto px-4 py-2">
            {navLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                {index > 0 && <div className="border-t border-white/5" />}
                <Link 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-2 text-sm font-medium transition-colors ${
                    isActive(link.href) 
                      ? 'text-blue-400' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
