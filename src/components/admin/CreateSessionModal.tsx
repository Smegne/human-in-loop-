'use client';

import { useState } from 'react';
import { Play, Copy, Check, X, Clock } from 'lucide-react';
import { createMonitoringSession } from '@/app/actions/session';

interface CreateSessionModalProps {
  employeeId: string;
  employeeName: string;
}

export default function CreateSessionModal({ employeeId, employeeName }: CreateSessionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(60);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const res = await createMonitoringSession(employeeId, duration);
      if (res.success) {
        setSessionUrl(res.sessionUrl);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (sessionUrl) {
      navigator.clipboard.writeText(sessionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSessionUrl(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-md bg-devvoltz-primary px-3 py-1.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow-400"
      >
        <Play className="h-4 w-4" />
        New Session
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Session for {employeeName}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {!sessionUrl ? (
              <div className="py-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Generate a secure, unique link for this monitoring session. The employee must open this link to grant permission.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Session Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-devvoltz-secondary focus:ring-1 focus:ring-devvoltz-secondary"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={120}>2 Hours</option>
                    <option value={240}>4 Hours</option>
                    <option value={480}>8 Hours</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button
                    onClick={closeModal}
                    className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-md bg-devvoltz-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
                  >
                    {isLoading ? 'Generating...' : 'Generate Link'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-4">
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <h4 className="font-medium text-green-800">Session Generated!</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Send this secure link to the employee. It will expire after use.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sessionUrl}
                    className="flex-1 rounded-md border border-gray-300 bg-gray-50 p-2 text-sm text-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center rounded-md bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={closeModal}
                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
