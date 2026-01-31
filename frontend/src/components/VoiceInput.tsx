/**
 * Voice Input Component - Reflection.app-inspired soft button style
 * "Whispered Clarity" aesthetic
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isDisabled?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, isDisabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useWhisper, setUseWhisper] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Keep refs in sync
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Initialize Web Speech API once
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Detect Brave browser (blocks Web Speech API)
    const isBrave = (navigator as any).brave !== undefined;

    if (!SpeechRecognition || isBrave) {
      setUseWhisper(true);
      console.log('Web Speech API not available or Brave browser detected, using Whisper');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setStatusMessage('Listening...');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        setStatusMessage(`"${interimTranscript.slice(0, 30)}${interimTranscript.length > 30 ? '...' : ''}"`);
      }

      if (finalTranscript.trim()) {
        console.log('Final transcript:', finalTranscript);
        onTranscriptRef.current(finalTranscript);
        setStatusMessage('Added!');

        setTimeout(() => {
          if (isListeningRef.current) {
            setStatusMessage('Listening...');
          }
        }, 1000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        // Browser blocks Web Speech API, switch to Whisper
        console.log('Web Speech blocked, switching to Whisper');
        setUseWhisper(true);
        setIsListening(false);
        setStatusMessage('Switching to Whisper...');
        setTimeout(() => setStatusMessage(''), 2000);
      } else if (event.error === 'no-speech') {
        setStatusMessage('No speech...');
      } else if (event.error === 'aborted') {
        // Intentional stop, ignore
      } else {
        setStatusMessage(`Error: ${event.error}`);
        setTimeout(() => setStatusMessage(''), 2000);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended, isListening:', isListeningRef.current);
      if (isListeningRef.current) {
        // Auto-restart if still listening
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log('Restarted recognition');
            } catch (e) {
              console.log('Could not restart:', e);
              setIsListening(false);
              setStatusMessage('');
            }
          }
        }, 100);
      } else {
        setStatusMessage('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Cleanup
        }
      }
    };
  }, []); // Empty deps - only initialize once

  // Whisper API transcription
  const transcribeWithWhisper = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    setStatusMessage('Transcribing...');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        onTranscriptRef.current(data.text + ' ');
        setStatusMessage('Added!');
      } else {
        setStatusMessage('No speech detected');
      }
    } catch (error) {
      console.error('Whisper error:', error);
      setStatusMessage('Failed');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(''), 2000);
    }
  }, []);

  // Toggle Whisper recording
  const toggleWhisperRecording = useCallback(async () => {
    if (isListeningRef.current) {
      setIsListening(false);
      setStatusMessage('Processing...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            transcribeWithWhisper(audioBlob);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsListening(true);
        setStatusMessage('Recording...');
      } catch (error) {
        console.error('Mic access error:', error);
        setStatusMessage('Mic blocked');
        setTimeout(() => setStatusMessage(''), 2000);
      }
    }
  }, [transcribeWithWhisper]);

  // Toggle Web Speech API
  const toggleWebSpeech = useCallback(async () => {
    if (isListeningRef.current) {
      console.log('Stopping recognition');
      setIsListening(false);
      setStatusMessage('');
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.log('Stop error:', e);
      }
    } else {
      console.log('Starting recognition');
      try {
        // Request mic permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsListening(true);
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Start error:', error);
        setIsListening(false);
        setStatusMessage('Mic blocked');
        setTimeout(() => setStatusMessage(''), 2000);
      }
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (useWhisper) {
      toggleWhisperRecording();
    } else {
      toggleWebSpeech();
    }
  }, [useWhisper, toggleWhisperRecording, toggleWebSpeech]);

  return (
    <div className="relative group">
      <button
        onClick={toggleListening}
        disabled={isDisabled || isProcessing}
        className={`
          relative w-11 h-11 rounded-xl transition-all duration-300 flex items-center justify-center
          ${isListening
            ? 'bg-[#D49B9B] text-white shadow-md'
            : 'bg-[#F8F7FC] text-[#6B6880] hover:bg-[#F3F1FA] hover:text-[#2D2A3E] border border-[rgba(139,126,200,0.1)]'
          }
          ${isProcessing ? 'opacity-60' : ''}
          disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-95
        `}
        title={isListening ? 'Stop recording' : 'Voice input'}
      >
        {/* Pulse animation when listening */}
        {isListening && (
          <span className="absolute inset-0 rounded-xl bg-[#D49B9B] animate-ping opacity-30" />
        )}

        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin relative z-10" />
        ) : isListening ? (
          <MicOff className="w-5 h-5 relative z-10" />
        ) : (
          <Mic className="w-5 h-5 relative z-10" />
        )}
      </button>

      {/* Status tooltip */}
      {statusMessage && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#2D2A3E] text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 animate-fade-in">
          {statusMessage}
          <div className="absolute -bottom-1 right-4 w-2 h-2 bg-[#2D2A3E] rotate-45" />
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
