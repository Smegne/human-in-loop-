'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle, VideoOff, Monitor } from 'lucide-react';

interface WebRTCEmployeeProps {
  sessionId: string;
}

export default function WebRTCEmployee({ sessionId }: WebRTCEmployeeProps) {
  const [status, setStatus] = useState<string>('Starting...');
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    let lastMessageId: string | null = null;

    const initWebRTC = async () => {
      try {
        // ── Check screen share support ───────────────────────────────────────
        if (
          typeof navigator === 'undefined' ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getDisplayMedia !== 'function'
        ) {
          throw new Error(
            'Screen sharing is not supported on this browser or device. ' +
            'Please use Chrome or Firefox on a desktop computer, or Chrome on Android.'
          );
        }

        // ── Get screen stream ────────────────────────────────────────────────
        setStatus('Requesting screen permission...');
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 15, max: 30 } },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        stream.getVideoTracks()[0].onended = () => {
          if (isMounted) setStatus('Screen sharing stopped by user.');
        };

        // ── Peer connection ──────────────────────────────────────────────────
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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

        // ── Poll for answer / control messages ───────────────────────────────
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
                if (isMounted) {
                  setStatus('Connected — streaming your screen securely.');
                  setConnected(true);
                }
              } else if (msg.type === 'ice-candidate') {
                const candidate = JSON.parse(msg.payload);
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } else if (msg.type === 'stop-session' && msg.sender === 'ADMIN') {
                if (isMounted) setStatus('Session ended by the administrator.');
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
          setError(err instanceof Error ? err.message : 'Failed to start screen share.');
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

  // ── Error state (includes unsupported browser/device) ─────────────────────
  if (error) {
    const isUnsupported = error.includes('not supported');
    return (
      <div className={`rounded-lg p-6 border text-center animate-in fade-in mt-6 ${isUnsupported ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4 ${isUnsupported ? 'bg-yellow-100' : 'bg-red-100'}`}>
          {isUnsupported
            ? <Monitor className="h-7 w-7 text-yellow-600" />
            : <VideoOff className="h-6 w-6 text-red-600" />
          }
        </div>
        <h3 className={`text-lg font-bold mb-2 ${isUnsupported ? 'text-yellow-900' : 'text-red-900'}`}>
          {isUnsupported ? 'Screen Sharing Not Supported' : 'Connection Error'}
        </h3>
        <p className={`text-sm max-w-sm mx-auto ${isUnsupported ? 'text-yellow-800' : 'text-red-700'}`}>
          {error}
        </p>
        {isUnsupported && (
          <div className="mt-4 text-xs text-yellow-700 space-y-1">
            <p>✅ Works on: <strong>Chrome / Edge / Firefox</strong> on Windows, Mac, Linux</p>
            <p>✅ Works on: <strong>Chrome</strong> on Android</p>
            <p>❌ Not supported on: <strong>iOS Safari / iPhone / iPad</strong></p>
          </div>
        )}
      </div>
    );
  }

  // ── Normal state ────────────────────────────────────────────────────────────
  return (
    <div className="rounded-lg bg-green-50 p-6 border border-green-200 text-center animate-in fade-in mt-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
        {connected
          ? <CheckCircle className="h-6 w-6 text-green-600" />
          : <Activity className="h-6 w-6 text-green-600 animate-pulse" />
        }
      </div>
      <h3 className="text-lg font-bold text-green-900 mb-1">
        {connected ? 'Live Session Active' : 'Live Session'}
      </h3>
      <p className="text-sm text-green-700">{status}</p>
    </div>
  );
}
