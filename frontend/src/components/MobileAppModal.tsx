'use client';

import React, { useState } from 'react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAppModal({ isOpen, onClose }: MobileAppModalProps) {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-16 right-4 z-[60] w-80 max-h-[calc(100vh-5rem)] overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl"
    >
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Install on Mobile</h2>
            <p className="text-slate-400 text-xs">Add to your home screen</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            iPhone
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.341c-.5 0-.906.406-.906.906s.406.906.906.906.906-.406.906-.906-.406-.906-.906-.906zm-11.046 0c-.5 0-.906.406-.906.906s.406.906.906.906.906-.406.906-.906-.406-.906-.906-.906zM17.1 7.3l1.506-2.61a.314.314 0 00-.544-.314l-1.525 2.643A9.117 9.117 0 0012 6.017a9.117 9.117 0 00-4.537 1.002L5.938 4.376a.314.314 0 00-.544.314L6.9 7.3C4.15 8.776 2.29 11.56 2 14.85h20c-.29-3.29-2.15-6.074-4.9-7.55z"/>
            </svg>
            Android
          </button>
        </div>

        {activeTab === 'ios' && (
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-white text-sm font-medium">Open in Safari</p>
                  <p className="text-slate-400 text-xs mt-0.5">Visit TickerGrade in Safari browser</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-white text-sm font-medium">Tap Share Icon</p>
                  <p className="text-slate-400 text-xs mt-0.5">Square with arrow up at bottom</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-white text-sm font-medium">Add to Home Screen</p>
                  <p className="text-slate-400 text-xs mt-0.5">Scroll down and tap this option</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <div>
                  <p className="text-white text-sm font-medium">Confirm</p>
                  <p className="text-slate-400 text-xs mt-0.5">Tap "Add" in top right corner</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'android' && (
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-white text-sm font-medium">Open in Chrome</p>
                  <p className="text-slate-400 text-xs mt-0.5">Visit TickerGrade in Chrome browser</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-white text-sm font-medium">Tap Menu Icon</p>
                  <p className="text-slate-400 text-xs mt-0.5">Three dots in top right corner</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-white text-sm font-medium">Add to Home Screen</p>
                  <p className="text-slate-400 text-xs mt-0.5">Or tap "Install App" if shown</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <div>
                  <p className="text-white text-sm font-medium">Confirm</p>
                  <p className="text-slate-400 text-xs mt-0.5">Tap "Add" to confirm</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200 text-xs text-center">
            Creates a native app-like experience on your phone
          </p>
        </div>
      </div>
    </div>
  );
}
