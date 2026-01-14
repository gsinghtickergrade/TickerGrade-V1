'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">Contact</h1>

        <Card className="p-8 bg-white/5 border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Need Help or Have Feedback?</h2>
          
          <p className="text-slate-300 mb-6">
            We are currently in Beta. If you spot a bug or have a feature request, please use the{' '}
            <Link href="/feedback" className="text-blue-400 hover:text-blue-300 underline">
              Feedback
            </Link>{' '}
            tab at the top of the screen.
          </p>
          
          <p className="text-slate-300">
            For all other matters, email us at{' '}
            <a 
              href="mailto:support@tickergrade.io" 
              className="text-blue-400 hover:text-blue-300 underline"
            >
              support@tickergrade.io
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
