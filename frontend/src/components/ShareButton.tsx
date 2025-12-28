'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  ticker: string;
  score: number;
  verdict: string;
}

export function ShareButton({ ticker, score, verdict }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title: `${ticker} Swing Trade Analysis`,
      text: `${ticker} scored ${score}/10 on the Swing Trading Decision Engine. Verdict: ${verdict}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          fallbackCopy(shareData.text);
        }
      }
    } else {
      fallbackCopy(shareData.text);
    }
  };

  const fallbackCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Analysis copied to clipboard!');
    }).catch(() => {
      alert('Unable to share. Please copy the URL manually.');
    });
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="border-white/20 text-white hover:bg-white/10"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share
    </Button>
  );
}
