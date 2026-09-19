import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, AlertCircle } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (transcript: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch
}) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setTranscript('');
      setErrorMsg(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Voice search is not supported in this browser.');
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;

      rec.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      rec.onresult = (event: any) => {
        const current = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(current);

        if (event.results[0].isFinal) {
          rec.stop();
          setIsListening(false);
          if (current.trim()) {
            setTimeout(() => {
              onSearch(current.trim());
              onClose();
            }, 600);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech was detected. Please tap microphone to try again.');
        } else {
          setErrorMsg('Voice input paused. Tap microphone to restart.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (err: any) {
      console.warn('Voice recognition initialization notice:', err);
      setErrorMsg('Unable to initialize voice capture. Please verify permissions.');
      setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, onSearch, onClose]);

  if (!isOpen) return null;

  const retryListening = () => {
    setErrorMsg(null);
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/30 bg-slate-900/95 dark:bg-slate-900/95 p-6 sm:p-8 text-center shadow-2xl shadow-cyan-500/10 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close voice search"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            ANTIQORA Neural Voice Search
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {errorMsg ? 'Voice Search Status' : isListening ? 'Listening for your query...' : 'Voice processing ready'}
          </p>
        </div>

        {/* Animation & Mic Icon */}
        <div className="relative flex items-center justify-center py-4">
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/10 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-indigo-500/10 animate-pulse" />
            </>
          )}

          <button
            onClick={retryListening}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              errorMsg
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                : isListening
                ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 shadow-cyan-500/40 scale-110'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-cyan-400'
            }`}
            aria-label={isListening ? 'Listening' : 'Start listening'}
          >
            {errorMsg ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        {/* Sound Wave Graphic when listening */}
        {isListening && !errorMsg && (
          <div className="flex items-center justify-center gap-1.5 h-6">
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
            <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
            <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-6" style={{ animationDelay: '300ms' }} />
            <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-4" style={{ animationDelay: '450ms' }} />
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2" style={{ animationDelay: '600ms' }} />
          </div>
        )}

        {/* Live Transcript or Instruction */}
        <div className="min-h-[3.5rem] flex items-center justify-center px-4">
          {errorMsg ? (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : transcript ? (
            <p className="text-base font-semibold text-cyan-300 italic">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Speak naturally (e.g. "Quantum Computing", "Next-gen solar tech")
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {transcript && !errorMsg && (
            <button
              onClick={() => {
                onSearch(transcript);
                onClose();
              }}
              className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Search Now
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
