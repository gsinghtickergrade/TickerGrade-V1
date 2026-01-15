'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileAppModal } from './MobileAppModal';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileAppModalOpen, setMobileAppModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => pathname === path;
  const isAboutActive = () => ['/our-story', '/legal', '/contact'].includes(pathname);
  
  const mainNavLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/methodology', label: 'Methodology' },
    { href: '/guide', label: 'User Guide' },
    { href: '/trade-ideas', label: 'Trade Ideas' },
    { href: '/feedback', label: 'Feedback' },
  ];
  
  const aboutLinks = [
    { href: '/our-story', label: 'Our Story' },
    { href: '/legal', label: 'Legal & Compliance' },
    { href: '/contact', label: 'Contact' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            TickerGrade
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  isAboutActive() ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                About
                <svg 
                  className={`w-4 h-4 transition-transform ${aboutDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {aboutDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setAboutDropdownOpen(false)}
                      className={`block px-4 py-3 text-sm transition-colors ${
                        isActive(link.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {mainNavLinks.slice(1, 4).map((link) => (
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
            
            <button
              onClick={() => setMobileAppModalOpen(true)}
              className="text-sm font-medium transition-colors text-slate-400 hover:text-white flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile App
            </button>
            
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
            <Link 
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 px-2 text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            
            <div className="border-t border-white/5" />
            
            <button
              onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
              className={`w-full flex items-center justify-between py-3 px-2 text-sm font-medium transition-colors ${
                isAboutActive() ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              About
              <svg 
                className={`w-4 h-4 transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {mobileAboutOpen && (
              <div className="pl-4 border-l border-white/10 ml-2">
                {aboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => { setMobileMenuOpen(false); setMobileAboutOpen(false); }}
                    className={`block py-2 px-2 text-sm transition-colors ${
                      isActive(link.href)
                        ? 'text-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            
            {mainNavLinks.slice(1, 4).map((link) => (
              <React.Fragment key={link.href}>
                <div className="border-t border-white/5" />
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
            
            <div className="border-t border-white/5" />
            <button
              onClick={() => { setMobileMenuOpen(false); setMobileAppModalOpen(true); }}
              className="w-full text-left py-3 px-2 text-sm font-medium transition-colors text-slate-400 hover:text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile App
            </button>
            
            <div className="border-t border-white/5" />
            <Link 
              href="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 px-2 text-sm font-medium transition-colors ${
                isActive('/feedback') 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Feedback
            </Link>
          </div>
        </div>
      )}
      
      <MobileAppModal 
        isOpen={mobileAppModalOpen} 
        onClose={() => setMobileAppModalOpen(false)} 
      />
    </nav>
  );
}
