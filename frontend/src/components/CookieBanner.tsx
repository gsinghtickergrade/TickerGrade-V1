'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('swingtrader_cookie_accepted');
    if (!hasDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('swingtrader_cookie_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-900 border-t border-white/10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-300 text-sm text-center sm:text-left">
          We use cookies for authentication and to improve your experience. By continuing to use this site, you accept our use of cookies.
        </p>
        <Button 
          onClick={handleDismiss}
          variant="outline"
          className="shrink-0 border-white/20 text-white hover:bg-white/10"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
