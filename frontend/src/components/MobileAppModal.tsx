'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAppModal({ isOpen, onClose }: MobileAppModalProps) {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <Card className="relative z-10 w-full max-w-lg bg-slate-800 border-slate-700 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Install TickerGrade on Mobile</h2>
          <p className="text-slate-400">Get the Full App Experience</p>
          <p className="text-slate-500 text-sm mt-1">Add TickerGrade to your home screen for full-screen access.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ios'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            iPhone
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'android'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.341c-.5 0-.906.406-.906.906s.406.906.906.906.906-.406.906-.906-.406-.906-.906-.906zm-11.046 0c-.5 0-.906.406-.906.906s.406.906.906.906.906-.406.906-.906-.406-.906-.906-.906zM17.1 7.3l1.506-2.61a.314.314 0 00-.544-.314l-1.525 2.643A9.117 9.117 0 0012 6.017a9.117 9.117 0 00-4.537 1.002L5.938 4.376a.314.314 0 00-.544.314L6.9 7.3C4.15 8.776 2.29 11.56 2 14.85h20c-.29-3.29-2.15-6.074-4.9-7.55z"/>
            </svg>
            Android
          </button>
        </div>

        {activeTab === 'ios' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Open in Safari
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Open <span className="text-blue-400 font-medium">TickerGrade.io</span> in <span className="font-medium text-white">Safari</span> browser.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Tap Share Icon
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Tap the <span className="font-medium text-white">Share Icon</span> (square with an arrow up) at the bottom of the screen.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Add to Home Screen
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Scroll down and tap <span className="font-medium text-white">"Add to Home Screen"</span>.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Confirm
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Click <span className="font-medium text-white">Add</span> in the top right corner.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'android' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Open in Chrome
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Open <span className="text-blue-400 font-medium">TickerGrade.io</span> in <span className="font-medium text-white">Chrome</span> browser.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Tap Menu Icon
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Tap the <span className="font-medium text-white">Menu Icon</span> (three dots) in the top right corner.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Add to Home Screen
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Tap <span className="font-medium text-white">"Add to Home Screen"</span> or <span className="font-medium text-white">"Install App"</span>.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Confirm
              </h3>
              <p className="text-slate-300 text-sm pl-8">
                Click <span className="font-medium text-white">Add</span> to confirm.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200 text-sm text-center">
            This creates a fast, full-screen app icon on your phone just like a native app.
          </p>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white"
        >
          Got it!
        </Button>
      </Card>
    </div>
  );
}
