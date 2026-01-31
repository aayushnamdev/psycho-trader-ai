import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

const VoiceToTextInput = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [useWhisper, setUseWhisper] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setUseWhisper(true); // Fallback to Whisper if Web Speech API not available
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
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

      setText(prev => {
        // Only append final transcript
        if (finalTranscript) {
          return prev + finalTranscript;
        }
        return prev;
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (useWhisper) {
      // Use Whisper API (MediaRecorder)
      if (isListening) {
        mediaRecorderRef.current?.stop();
        setIsListening(false);
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = async () => {
            setIsProcessing(true);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Convert to text using Whisper API
            const transcription = await transcribeWithWhisper(audioBlob);
            setText(prev => prev + transcription + ' ');
            
            setIsProcessing(false);
            stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error accessing microphone:', error);
          alert('Could not access microphone. Please grant permission.');
        }
      }
    } else {
      // Use Web Speech API
      if (!isSupported) {
        alert('Speech recognition is not supported in your browser. Switching to Whisper API...');
        setUseWhisper(true);
        return;
      }

      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const transcribeWithWhisper = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer YOUR_OPENAI_API_KEY_HERE`, // Replace with your API key
        },
        body: formData
      });

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Whisper API error:', error);
      return '[Transcription failed]';
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      console.log('Submitted text:', text);
      // Here you would send the text to your backend
      // For now, just clear the text
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Main Input Container */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-1 shadow-2xl">
          <div className="bg-slate-900/90 rounded-3xl p-6">
            
            {/* Input Area */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Express what's weighing on your mind..."
                className="w-full bg-slate-800/50 text-white placeholder-slate-400 rounded-2xl px-6 py-4 pr-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 min-h-[120px]"
                style={{
                  fontSize: '15px',
                  lineHeight: '24px',
                  letterSpacing: '-0.01em'
                }}
              />
              
              {/* Button Container */}
              <div className="absolute right-4 bottom-4 flex gap-2">
                {/* Voice Button */}
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white shadow-lg hover:shadow-xl transform hover:scale-105`}
                  title={isListening ? 'Stop recording' : 'Start recording'}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status Indicator */}
            {isListening && (
              <div className="mt-4 flex items-center gap-2 text-red-400 animate-fade-in">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">
                  {useWhisper ? 'Recording...' : 'Listening...'}
                </span>
              </div>
            )}

            {isProcessing && (
              <div className="mt-4 flex items-center gap-2 text-purple-400 animate-fade-in">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Processing audio...</span>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-slate-400 text-xs text-center mt-4">
              A space for reflection • Not therapy or financial advice
            </p>
          </div>
        </div>

        {/* Browser Support Notice */}
        {!isSupported && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm text-center">
              Using Whisper API for transcription (works in all browsers)
            </p>
          </div>
        )}

        {/* API Mode Toggle */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-slate-400 text-sm">Transcription:</span>
          <button
            onClick={() => setUseWhisper(!useWhisper)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
          >
            {useWhisper ? '🌐 Whisper API' : '🎤 Web Speech API'} 
            <span className="ml-2 text-xs text-slate-500">
              {useWhisper ? '(All browsers)' : '(Chrome/Safari)'}
            </span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-slate-400 text-sm space-y-2">
          <p>Click the microphone to start voice input</p>
          <p className="text-xs">Press Enter to send • Shift + Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceToTextInput;