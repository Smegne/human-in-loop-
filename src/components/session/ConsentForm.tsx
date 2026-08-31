'use client';

import { useState } from 'react';
import { acceptMonitoringSession } from '@/app/actions/acceptSession';
import { Check, ShieldAlert } from 'lucide-react';

import WebRTCEmployee from './WebRTCEmployee';

interface ConsentFormProps {
  sessionId: string;
  secureToken: string;
  employeeName: string;
}

export default function ConsentForm({ sessionId, secureToken, employeeName }: ConsentFormProps) {
  const [agreed, setAgreed] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    if (!agreed) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      const res = await acceptMonitoringSession(secureToken);
      if (res.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept session');
      setIsJoining(false);
    }
  };

  if (success) {
    return <WebRTCEmployee sessionId={sessionId} />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
        <div className="flex h-5 items-center mt-0.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-devvoltz-secondary focus:ring-devvoltz-secondary"
          />
        </div>
        <div className="text-sm">
          <p className="font-medium text-gray-900">Explicit Consent</p>
          <p className="text-gray-500">
            I, {employeeName}, acknowledge that this is a monitored session. I consent to my screen being viewed and recorded for the duration of this session.
          </p>
        </div>
      </label>

      <button
        onClick={handleJoin}
        disabled={!agreed || isJoining}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-devvoltz-secondary py-3 px-4 text-sm font-bold text-white transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        <ShieldAlert className="h-4 w-4 text-devvoltz-primary" />
        {isJoining ? 'Joining Session...' : 'I Agree & Join Session'}
      </button>
    </div>
  );
}
