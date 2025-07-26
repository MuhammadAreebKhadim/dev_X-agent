import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, MicOff, Volume2, VolumeX, Zap, Waves, 
  Settings, Languages, PlayCircle, StopCircle,
  MessageSquare, Bot, User
} from "lucide-react";

interface VoiceInterfaceProps {
  isListening: boolean;
  onToggleListening: () => void;
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  isProcessing: boolean;
  onManualSubmit: (text: string) => void;
}

export default function EnhancedVoiceInterface({
  isListening,
  onToggleListening,
  transcript,
  confidence,
  detectedLanguage,
  isProcessing,
  onManualSubmit
}: VoiceInterfaceProps) {
  const [manualInput, setManualInput] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  // Simulate audio level for visual feedback
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onManualSubmit(manualInput);
      setRecentCommands(prev => [manualInput, ...prev.slice(0, 4)]);
      setManualInput("");
      setShowManualInput(false);
    }
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪',
      'it': '🇮🇹', 'pt': '🇵🇹', 'ru': '🇷🇺', 'zh': '🇨🇳',
      'ja': '🇯🇵', 'ko': '🇰🇷', 'ar': '🇸🇦', 'hi': '🇮🇳',
      'ur': '🇵🇰'
    };
    return flags[lang.slice(0, 2)] || '🌐';
  };

  return (
    <Card className="glass-effect border-white/10 card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <span className="gradient-text">Voice Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {getLanguageFlag(detectedLanguage)} {detectedLanguage}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowManualInput(!showManualInput)}
              className="h-7 px-2 button-ripple"
            >
              <MessageSquare className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Voice Control */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Button
              size="lg"
              onClick={onToggleListening}
              disabled={isProcessing}
              className={`
                h-20 w-20 rounded-full button-ripple transition-all duration-300
                ${isListening 
                  ? 'bg-red-500 hover:bg-red-600 voice-pulse neon-glow' 
                  : 'bg-blue-500 hover:bg-blue-600'
                }
                ${isProcessing ? 'animate-pulse' : ''}
              `}
            >
              {isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
            
            {/* Audio Level Visualization */}
            {isListening && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-400 rounded-full wave-bar"
                    style={{
                      height: `${Math.max(4, (audioLevel + i * 10) % 20)}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">
              {isListening ? (
                <span className="text-red-400 animate-pulse">🔴 Listening...</span>
              ) : isProcessing ? (
                <span className="text-yellow-400">⚡ Processing...</span>
              ) : (
                <span className="text-gray-400">Click to start voice input</span>
              )}
            </p>
          </div>
        </div>

        {/* Confidence and Status */}
        {confidence > 0 && (
          <div className="space-y-2 fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Confidence</span>
              <span className="text-blue-400">{Math.round(confidence * 100)}%</span>
            </div>
            <Progress value={confidence * 100} className="h-1" />
          </div>
        )}

        {/* Live Transcript */}
        {transcript && (
          <div className="p-3 glass-effect rounded-lg border border-blue-400/30 slide-in-up">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">Voice Input</span>
            </div>
            <p className="text-sm text-gray-200">{transcript}</p>
          </div>
        )}

        {/* Manual Input */}
        {showManualInput && (
          <div className="space-y-3 slide-in-up">
            <Textarea
              placeholder="Type your command manually..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="glass-effect border-blue-400/30 min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleManualSubmit();
                }
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Ctrl+Enter to submit</span>
              <Button
                size="sm"
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="button-ripple"
              >
                Send Command
              </Button>
            </div>
          </div>
        )}

        {/* Recent Commands */}
        {recentCommands.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Recent Commands
            </h4>
            <div className="space-y-1">
              {recentCommands.map((cmd, index) => (
                <div
                  key={index}
                  className="text-xs p-2 glass-effect rounded cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => {
                    setManualInput(cmd);
                    setShowManualInput(true);
                  }}
                >
                  <span className="text-gray-300">"{cmd}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="text-xs space-y-1 text-gray-400">
          <p className="font-medium">💡 Example Commands:</p>
          <ul className="space-y-1 pl-2">
            <li>• "Create a Python file named app"</li>
            <li>• "Create a JavaScript file named script"</li>
            <li>• "Make a CSS file called styles"</li>
            <li>• "Generate a Java file named Main"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}