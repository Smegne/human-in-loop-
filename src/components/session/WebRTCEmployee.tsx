'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle, VideoOff, Camera, Monitor } from 'lucide-react';

interface WebRTCEmployeeProps {
  sessionId: string;
}

/** Returns true if getDisplayMedia (screen share) is available. */
function isScreenShareSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
}

/** Returns true if getUserMedia (camera) is available. */
function isCameraSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

export default function WebRTCEmployee({ sessionId }: WebRTCEmployeeProps) {
  const [status, setStatus] = useState<string>('Starting...');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'screen' | 'camera' | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    let lastMessageId: string | null = null;

    const initWebRTC = async () => {
      try {
        let stream: MediaStream;
        let captureMode: 'screen' | 'camera';

        // ── Choose capture method ────────────────────────────────────────────
        if (isScreenShareSupported()) {
          // Desktop or Android Chrome: use screen share
          captureMode = 'screen';
          setMode('screen');
          setStatus('Requesting screen permission...');
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: { ideal: 15, max: 30 } },
            audio: false,
          });
        } else if (isCameraSupported()) {
          // iOS / unsupported browser: fall back to camera
          captureMode = 'camera';
          setMode('camera');
          setStatus('Requesting camera permission...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
        } else {
          throw new Error(
            'Your browser does not support screen sharing or camera access. ' +
            'Please use Chrome or Firefox on a desktop computer.'
          );
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        // Show local preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Listen for user stopping the stream via browser UI
        stream.getVideoTracks()[0].onended = () => {
          if (isMounted) setStatus('Stream stopped by user.');
        };

        // ── Peer Connection ──────────────────────────────────────────────────
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // ── ICE candidates ───────────────────────────────────────────────────
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await fetch('/api/signaling', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                sender: 'EMPLOYEE',
                type: 'ice-candidate',
                payload: event.candidate,
              }),
            });
          }
        };

        // ── Create & send offer ──────────────────────────────────────────────
        setStatus('Creating connection...');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await fetch('/api/signaling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            sender: 'EMPLOYEE',
            type: 'offer',
            payload: offer,
          }),
        });

        setStatus('Waiting for admin to connect...');

        // ── Poll for answer / ICE / control messages ─────────────────────────
        pollingIntervalRef.current = setInterval(async () => {
          try {
            let url = `/api/signaling?sessionId=${sessionId}&sender=EMPLOYEE`;
            if (lastMessageId) url += `&lastId=${lastMessageId}`;

            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();

            for (const msg of data.messages) {
              lastMessageId = msg.id;

              if (msg.type === 'answer') {
                const answer = JSON.parse(msg.payload);
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                setStatus(
                  captureMode === 'screen'
                    ? 'Connected — streaming your screen.'
                    : 'Connected — streaming your camera.'
                );
              } else if (msg.type === 'ice-candidate') {
                const candidate = JSON.parse(msg.payload);
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } else if (msg.type === 'stop-session' && msg.sender === 'ADMIN') {
                setStatus('Session ended by the administrator.');
                streamRef.current?.getTracks().forEach((t) => t.stop());
                peerConnectionRef.current?.close();
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              }
            }
          } catch (err) {
            console.error('Polling error:', err);
          }
        }, 2000);
      } catch (err: unknown) {
        console.error('WebRTC error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to start session.');
        }
      }
    };

    initWebRTC();

    return () => {
      isMounted = false;
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      peerConnectionRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [sessionId]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 border border-red-200 text-center animate-in fade-in mt-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <VideoOff className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-red-900 mb-2">Connection Error</h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const isConnected =
    status.startsWith('Connected');

  return (
    <div className="rounded-lg bg-green-50 p-6 border border-green-200 text-center animate-in fade-in mt-6 space-y-4">
      {/* Mode badge */}
      {mode && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
          {mode === 'screen' ? (
            <><Monitor className="h-3.5 w-3.5" /> Screen sharing</>
          ) : (
            <><Camera className="h-3.5 w-3.5" /> Camera (mobile fallback)</>
          )}
        </div>
      )}

      {/* Status icon */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        {isConnected ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <Activity className="h-6 w-6 text-green-600 animate-pulse" />
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-green-900 mb-1">Live Session</h3>
        <p className="text-sm text-green-700">{status}</p>
      </div>

      {/* Local camera preview (mobile only) */}
      {mode === 'camera' && (
        <div className="mt-2">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="mx-auto rounded-lg w-full max-w-xs border border-green-200 shadow-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            📱 Your camera is being shared. For screen sharing, open this link on a desktop computer.
          </p>
        </div>
      )}
    </div>
  );
}
