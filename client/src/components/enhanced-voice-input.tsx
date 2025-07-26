import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Zap, Waves, Radio } from "lucide-react";

interface EnhancedVoiceInputProps {
  onTranscript: (text: string) => void;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
  showVisualFeedback?: boolean;
  continuousMode?: boolean;
  language?: string;
}

export default function EnhancedVoiceInput({ 
  onTranscript, 
  isActive, 
  onActiveChange,
  showVisualFeedback = true,
  continuousMode = false,
  language = 'en-US'
}: EnhancedVoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.continuous = continuousMode;
      recognitionRef.current.lang = language;
    }
  }, [continuousMode, language]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition settings
      recognitionRef.current.continuous = continuousMode;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      recognitionRef.current.maxAlternatives = 3;

      // Event handlers
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = handleSpeechEnd;
      recognitionRef.current.onstart = handleSpeechStart;
    }
  };

  const handleSpeechResult = (event: any) => {
    let interim = '';
    let final = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      const confidence = event.results[i][0].confidence;
      
      if (event.results[i].isFinal) {
        final += transcript;
        setConfidence(confidence);
      } else {
        interim += transcript;
      }
    }
    
    setInterimTranscript(interim);
    
    if (final) {
      setFinalTranscript(final);
      onTranscript(final);
      
      if (!continuousMode) {
        stopListening();
      }
    }
  };

  const handleSpeechError = (event: any) => {
    console.error('Speech recognition error:', event.error);
    
    // Handle specific error types
    switch (event.error) {
      case 'network':
        console.log('Network error occurred');
        break;
      case 'audio-capture':
        console.log('Audio capture failed');
        break;
      case 'not-allowed':
        console.log('Permission denied for microphone');
        break;
      default:
        console.log('Unknown error:', event.error);
    }
    
    onActiveChange(false);
  };

  const handleSpeechEnd = () => {
    onActiveChange(false);
    stopAudioVisualization();
  };

  const handleSpeechStart = () => {
    onActiveChange(true);
    setInterimTranscript("");
    setFinalTranscript("");
    startAudioVisualization();
  };

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      console.warn('Speech recognition is not supported');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isActive) {
      recognitionRef.current.stop();
    }
  }, [isActive]);

  const startAudioVisualization = async () => {
    if (!showVisualFeedback) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average / 255);
        
        if (isActive) {
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start audio visualization:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
  };

  const cleanup = () => {
    stopAudioVisualization();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const toggleRecording = () => {
    if (isActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Visual feedback component
  const AudioWaveform = () => {
    if (!showVisualFeedback || !isActive) return null;
    
    return (
      <div className="flex items-center justify-center space-x-1 h-8">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="bg-blue-500 rounded-full transition-all duration-100"
            style={{
              width: '2px',
              height: `${Math.max(4, (audioLevel * 100 + Math.random() * 20))}%`,
              opacity: 0.7 + audioLevel * 0.3
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Radio className="w-4 h-4 text-blue-400" />
          <span>Voice Input</span>
          {isSupported ? (
            <Badge variant="outline" className="text-xs bg-green-600 text-white border-green-600">
              Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-red-600 text-white border-red-600">
              Not Supported
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Voice Input Button */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            onClick={toggleRecording}
            disabled={!isSupported}
            className={`w-20 h-20 rounded-full transition-all duration-200 ${
              isActive
                ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-lg shadow-red-600/50'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/50'
            }`}
          >
            {isActive ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </Button>
          
          {/* Status Text */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300">
              {isActive ? 'Listening...' : 'Click to speak'}
            </p>
            {confidence > 0 && (
              <p className="text-xs text-green-400">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            )}
          </div>
        </div>

        {/* Audio Visualization */}
        {showVisualFeedback && (
          <div className="bg-gray-900 rounded-lg p-4 min-h-[50px] flex items-center justify-center">
            {isActive ? (
              <AudioWaveform />
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <VolumeX className="w-4 h-4" />
                <span className="text-xs">Audio visualization</span>
              </div>
            )}
          </div>
        )}

        {/* Transcript Display */}
        <div className="space-y-2">
          {(interimTranscript || finalTranscript) && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
              <div className="text-xs text-gray-400 mb-1">Transcript:</div>
              {finalTranscript && (
                <div className="text-sm text-green-400 mb-1">
                  ✓ "{finalTranscript}"
                </div>
              )}
              {interimTranscript && (
                <div className="text-sm text-yellow-400 italic">
                  "{interimTranscript}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInterimTranscript("")}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {language}
            </Badge>
            {continuousMode && (
              <Badge variant="outline" className="text-xs bg-blue-600 text-white border-blue-600">
                Continuous
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Global type declarations for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}