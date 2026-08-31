'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, CheckCircle, VideoOff } from 'lucide-react';

interface WebRTCEmployeeProps {
  sessionId: string;
}

export default function WebRTCEmployee({ sessionId }: WebRTCEmployeeProps) {
  const [status, setStatus] = useState<string>('Initializing screen capture...');
  const [error, setError] = useState<string | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    let lastMessageId: string | null = null;

    const initWebRTC = async () => {
      try {
        // 1. Get Screen Stream
        setStatus('Requesting screen permission...');
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false, // For now, let's keep it simple with just video
        });
        
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        // Listen for user stopping screen share via browser UI
        stream.getVideoTracks()[0].onended = () => {
          if (isMounted) setStatus('Screen sharing stopped by user.');
        };

        // 2. Initialize Peer Connection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
          ],
        });
        peerConnectionRef.current = pc;

        // Add tracks
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // 3. Handle ICE Candidates
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

        // 4. Create Offer
        setStatus('Creating connection offer...');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send Offer to Admin
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

        // 5. Poll for Admin Answer and ICE Candidates
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
                setStatus('Connected and streaming securely.');
              } else if (msg.type === 'ice-candidate') {
                const candidate = JSON.parse(msg.payload);
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } else if (msg.type === 'stop-session' && msg.sender === 'ADMIN') {
                setStatus('Session was ended by the administrator.');
                if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
                if (peerConnectionRef.current) peerConnectionRef.current.close();
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              }
            }
          } catch (err) {
            console.error('Polling error:', err);
          }
        }, 2000);

      } catch (err: any) {
        console.error('WebRTC Error:', err);
        if (isMounted) setError(err.message || 'Failed to start screen share.');
      }
    };

    initWebRTC();

    return () => {
      isMounted = false;
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [sessionId]);

  return (
    <div className="rounded-lg bg-green-50 p-6 border border-green-200 text-center animate-in fade-in mt-6">
      {error ? (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <VideoOff className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Connection Error</h3>
          <p className="text-sm text-red-700">{error}</p>
        </>
      ) : (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            {status === 'Connected and streaming securely.' ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Activity className="h-6 w-6 text-green-600 animate-pulse" />
            )}
          </div>
          <h3 className="text-lg font-bold text-green-900 mb-2">Live Session</h3>
          <p className="text-sm text-green-700">{status}</p>
        </>
      )}
    </div>
  );
}
