'use client';

import { useState } from 'react';
import { Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { createExternalSession } from '@/app/actions/session';

export default function ExternalSessionButton() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const res = await createExternalSession();
      if (res.success && res.url) {
        await navigator.clipboard.writeText(res.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Failed to create external session:', err);
      alert('Failed to generate external link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerateLink}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
        copied 
          ? 'bg-green-100 text-green-700' 
          : 'bg-devvoltz-secondary text-[#FEE715] hover:bg-black'
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <LinkIcon className="h-4 w-4" />
      )}
      {copied ? 'Link Copied!' : 'Create External Link'}
    </button>
  );
}
