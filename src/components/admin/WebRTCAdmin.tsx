'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MonitorOff, StopCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WebRTCAdminProps {
  sessionId: string;
  initialStatus: string;
}

export default function WebRTCAdmin({ sessionId, initialStatus }: WebRTCAdminProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(
    initialStatus === 'PENDING' ? 'Waiting for employee to accept session...' : 'Connecting...'
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    let isMounted = true;
    let lastMessageId: string | null = null;
    let hasSentAnswer = false;

    const initViewer = async () => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });
      peerConnectionRef.current = pc;

      // When the remote stream arrives, attach it to the video element
      pc.ontrack = (event) => {
        if (!isMounted) return;
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
          setStatus('Connected');
          startRecording(event.streams[0]);
        }
      };

      // Send our ICE candidates to the Employee
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          await fetch('/api/signaling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              sender: 'ADMIN',
              type: 'ice-candidate',
              payload: event.candidate,
            }),
          });
        }
      };

      // Poll for Employee's Offer and ICE Candidates
      pollingIntervalRef.current = setInterval(async () => {
        try {
          let url = `/api/signaling?sessionId=${sessionId}&sender=ADMIN`;
          if (lastMessageId) url += `&lastId=${lastMessageId}`;

          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();

          for (const msg of data.messages) {
            lastMessageId = msg.id;

            if (msg.type === 'offer' && !hasSentAnswer) {
              hasSentAnswer = true;
              setStatus('Received screen stream, connecting...');
              const offer = JSON.parse(msg.payload);
              
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              // Send Answer to Employee
              await fetch('/api/signaling', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  sender: 'ADMIN',
                  type: 'answer',
                  payload: answer,
                }),
              });

            } else if (msg.type === 'ice-candidate') {
              if (pc.remoteDescription) {
                const candidate = JSON.parse(msg.payload);
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
            } else if (msg.type === 'stop-session' && msg.sender === 'EMPLOYEE') {
              // Handle case where employee stops sharing
              handleSessionStoppedRemotely();
            }
          }
        } catch (err) {
          console.error('Admin Polling error:', err);
        }
      }, 2000);
    };

    if (initialStatus !== 'COMPLETED') {
      initViewer();
    } else {
      setStatus('Session has been completed.');
    }

    return () => {
      isMounted = false;
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [sessionId, initialStatus]);

  const startRecording = (stream: MediaStream) => {
    try {
      // Check for supported mime types
      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
        ? 'video/webm; codecs=vp9' 
        : 'video/webm';
        
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          // Upload chunk
          const formData = new FormData();
          formData.append('sessionId', sessionId);
          formData.append('chunk', e.data);

          try {
            await fetch('/api/recordings/upload', {
              method: 'POST',
              body: formData,
            });
          } catch (err) {
            console.error('Failed to upload chunk:', err);
          }
        }
      };

      // Request data every 5 seconds
      recorder.start(5000);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopSession = async () => {
    setIsStopping(true);
    
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Stop WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Finalize recording and update DB
    try {
      await fetch('/api/recordings/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Failed to finalize session:', err);
      setIsStopping(false);
    }
  };

  const handleSessionStoppedRemotely = () => {
    setStatus('Employee stopped screen sharing.');
    setIsConnected(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    // We optionally can finalize here or let admin click stop.
  };

  if (initialStatus === 'COMPLETED') {
    return (
      <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-[#101820]">
        <div className="flex flex-col items-center">
          <MonitorOff className="h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-400 font-medium">This session has ended.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-[#101820]">
      {!isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 backdrop-blur-sm">
          {initialStatus === 'PENDING' && status.includes('Waiting') ? (
            <div className="animate-pulse flex flex-col items-center">
              <MonitorOff className="h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-400 font-medium">{status}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-devvoltz-primary animate-spin mb-4" />
              <p className="text-gray-300 font-medium">{status}</p>
            </div>
          )}
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-contain transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {isConnected && (
        <>
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-gray-700 shadow-lg">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wider">
              {isRecording ? 'REC' : 'LIVE'}
            </span>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <button
              onClick={stopSession}
              disabled={isStopping}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-medium shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isStopping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <StopCircle className="h-5 w-5" />
              )}
              {isStopping ? 'Ending Session...' : 'Stop Session'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
