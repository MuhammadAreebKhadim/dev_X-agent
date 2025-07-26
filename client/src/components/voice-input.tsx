import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

export default function VoiceInput({ onTranscript, isActive, onActiveChange }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onActiveChange(false);
      };

      recognitionRef.current.onend = () => {
        onActiveChange(false);
      };
    }
  }, [onTranscript, onActiveChange]);

  const toggleRecording = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    if (isActive) {
      recognitionRef.current?.stop();
      onActiveChange(false);
    } else {
      recognitionRef.current?.start();
      onActiveChange(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={toggleRecording}
        className={`w-12 h-12 rounded-full ${
          isActive
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        disabled={!isSupported}
      >
        {isActive ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </Button>
      
      {!isSupported && (
        <p className="text-xs text-red-400">Speech recognition not supported</p>
      )}
      
      <div className="text-xs text-center vscode-text-muted">
        {isActive ? "Listening..." : "Click to start listening"}
      </div>
    </div>
  );
}
