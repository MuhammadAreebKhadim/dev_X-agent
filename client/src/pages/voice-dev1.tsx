import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Folder, Search, Settings, Package, 
  FileText, Play, X, Code, CheckCircle, MessageSquare,
  FolderPlus, FilePlus, MoreHorizontal, ChevronRight, ChevronDown, Rocket, Edit,
  Monitor, Sparkles, Terminal
} from "lucide-react";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useCodeGeneration } from "@/hooks/use-code-generation";
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/confirmation-dialog";
import EnhancedFileExplorer from "@/components/enhanced-file-explorer";
import EnhancedVoiceInterface from "@/components/enhanced-voice-interface";
import EnhancedCodeTerminal from "@/components/enhanced-code-terminal";

interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: string;
  children?: FileStructure[];
}

interface PendingCode {
  code: string;
  language: string;
  fileName: string;
  confidence?: number;
}

interface AgentMessage {
  type: 'greeting' | 'confirmation' | 'completion' | 'question';
  message: string;
  timestamp?: number;
}

interface ActionHistory {
  id: string;
  type: 'file_created' | 'folder_created' | 'function_added' | 'code_modified';
  target: string;
  timestamp: number;
  details: any;
}

export default function VoiceDevEnhancedPage() {
  const [activeTab, setActiveTab] = useState("files");
  const [currentFile, setCurrentFile] = useState<FileStructure | null>(null);
  const [codeEditor, setCodeEditor] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [pendingCode, setPendingCode] = useState<PendingCode | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1', '2']);
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    { type: 'greeting', message: "Hello Sir! I'm your AI coding assistant. What would you like me to help you with today?" }
  ]);
  const [debugOutput, setDebugOutput] = useState("");
  const [isDebugging, setIsDebugging] = useState(false);
  const [fileExplorer, setFileExplorer] = useState<FileStructure[]>([
    { id: '1', name: 'src', type: 'folder', path: 'src', children: [] },
    { id: '2', name: 'components', type: 'folder', path: 'components', children: [] }
  ]);
  
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");
  const [detectedLanguage, setDetectedLanguage] = useState("English");
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [showTranscriptEditor, setShowTranscriptEditor] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  
  const supportedVoiceLanguages = [
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "ur-PK", name: "Urdu", flag: "🇵🇰" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" }
  ];
  
  const supportedProgrammingLanguages = [
    { name: "Python", icon: "🐍", color: "text-green-400" },
    { name: "JavaScript", icon: "⚡", color: "text-yellow-400" },
    { name: "TypeScript", icon: "📘", color: "text-blue-400" },
    { name: "Java", icon: "☕", color: "text-orange-400" },
    { name: "C++", icon: "⚙️", color: "text-red-400" },
    { name: "C#", icon: "🔷", color: "text-purple-400" },
    { name: "Go", icon: "🐹", color: "text-cyan-400" },
    { name: "Rust", icon: "🦀", color: "text-orange-400" },
    { name: "HTML", icon: "🌐", color: "text-orange-400" },
    { name: "CSS", icon: "🎨", color: "text-blue-400" }
  ];

  const { isListening, startListening, stopListening, transcript } = useVoiceRecognition();
  const { generateCode, isGenerating } = useCodeGeneration();
  const { toast } = useToast();

  const handleManualVoiceCommand = (command: string) => {
    addAgentMessage('confirmation', `Processing command: "${command}"`);
    handleVoiceCommand(command);
  };

  const handleVoiceCommand = async (command: string) => {
    if (!command.trim()) return;

    addAgentMessage('confirmation', `I heard: "${command}". Let me process that for you.`);

    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: command,
          language: detectLanguageFromContext(command),
          fileName: extractFileName(command) || 'untitled'
        }),
      });
      
      const result = await response.json();
      
      if (result.isFileCreation && result.fileName) {
        // Create file with proper extension
        const newFile: FileStructure = {
          id: Date.now().toString(),
          name: result.fileName,
          type: 'file',
          path: result.fileName,
          content: result.code,
          language: result.detectedLanguage || result.language
        };
        
        setFileExplorer(prev => [...prev, newFile]);
        setCurrentFile(newFile);
        setCodeEditor(result.code);
        
        addToHistory('file_created', result.fileName, { language: result.detectedLanguage || result.language });
        addAgentMessage('completion', `File "${result.fileName}" created successfully with ${result.detectedLanguage || result.language} code, Sir! What's next?`);
      } else {
        // Regular code generation
        setPendingCode({
          code: result.code,
          language: result.language,
          fileName: result.fileName,
          confidence: result.confidence
        });
        setShowConfirmation(true);
        addAgentMessage('question', `I've generated ${result.language} code. Would you like me to apply it, Sir?`);
      }
    } catch (error) {
      addAgentMessage('question', `I encountered an issue generating the code, Sir. Could you try rephrasing your request?`);
    }
  };

  const detectLanguageFromContext = (command: string): string => {
    const languageKeywords = {
      'css': ['css', 'style', 'stylesheet'],
      'html': ['html', 'webpage', 'page'],
      'javascript': ['javascript', 'js', 'script'],
      'python': ['python', 'py'],
      'java': ['java'],
      'typescript': ['typescript', 'ts'],
      'json': ['json', 'config'],
      'markdown': ['markdown', 'md', 'readme']
    };
    
    const lowerCommand = command.toLowerCase();
    for (const [lang, keywords] of Object.entries(languageKeywords)) {
      if (keywords.some(keyword => lowerCommand.includes(keyword))) {
        return lang;
      }
    }
    
    return 'javascript'; // default
  };

  const extractFileName = (command: string): string => {
    // Enhanced patterns to parse file name and language separately
    const filePatterns = [
      // "make a java file with the name of app" -> app.java
      /make\s+(?:a\s+)?(\w+)\s+file\s+with\s+(?:the\s+)?name\s+of\s+(.+)/i,
      // "create a python file named calculator" -> calculator.py
      /create\s+(?:a\s+)?(\w+)\s+file\s+(?:named|called)\s+(.+)/i,
      // "make css file with name style" -> style.css
      /make\s+(\w+)\s+file\s+with\s+name\s+(.+)/i,
      // "new javascript file app" -> app.js
      /(?:new|create)\s+(\w+)\s+file\s+(.+)/i,
      // General pattern
      /(?:create|make|new)\s+file\s+(.+)/i,
    ];
    
    for (const pattern of filePatterns) {
      const match = command.match(pattern);
      if (match) {
        if (match.length === 3 && match[1] && match[2]) {
          // Pattern with language and file name separated
          const language = match[1].toLowerCase().trim();
          const fileName = match[2].trim().replace(/['"]/g, ''); // Remove quotes
          const extension = getFileExtension(language);
          
          // If fileName already has extension, use as is, otherwise add detected extension
          return fileName.includes('.') ? fileName : `${fileName}${extension}`;
        } else if (match[1]) {
          // Simple file name without language specified
          const fileName = match[1].trim().replace(/['"]/g, '');
          return fileName.includes('.') ? fileName : `${fileName}.js`; // Default to .js
        }
      }
    }
    
    return '';
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      'javascript': '.js',
      'js': '.js',
      'typescript': '.ts',
      'ts': '.ts',
      'python': '.py',
      'py': '.py',
      'java': '.java',
      'css': '.css',
      'html': '.html',
      'htm': '.html',
      'json': '.json',
      'markdown': '.md',
      'md': '.md',
      'text': '.txt',
      'txt': '.txt',
      'cpp': '.cpp',
      'c++': '.cpp',
      'c': '.c',
      'csharp': '.cs',
      'c#': '.cs',
      'go': '.go',
      'rust': '.rs',
      'php': '.php',
      'ruby': '.rb',
      'swift': '.swift',
      'kotlin': '.kt',
      'dart': '.dart'
    };
    
    return extensions[language.toLowerCase()] || '.txt';
  };

  const addAgentMessage = (type: AgentMessage['type'], message: string) => {
    setAgentMessages(prev => [...prev, { type, message, timestamp: Date.now() }]);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const addToHistory = (type: ActionHistory['type'], target: string, details: any = {}) => {
    const action: ActionHistory = {
      id: Date.now().toString(),
      type,
      target,
      timestamp: Date.now(),
      details
    };
    setActionHistory(prev => [...prev, action]);
  };

  const handleApproveCode = () => {
    if (pendingCode) {
      if (currentFile) {
        // Update existing file
        setCodeEditor(pendingCode.code);
        setCurrentFile({ ...currentFile, content: pendingCode.code });
        setFileExplorer(prev => prev.map(file => 
          file.id === currentFile.id ? { ...file, content: pendingCode.code } : file
        ));
      } else {
        // Create new file
        const newFile: FileStructure = {
          id: Date.now().toString(),
          name: pendingCode.fileName || 'untitled.js',
          type: 'file',
          path: pendingCode.fileName || 'untitled.js',
          content: pendingCode.code,
          language: pendingCode.language
        };
        setFileExplorer(prev => [...prev, newFile]);
        setCurrentFile(newFile);
        setCodeEditor(pendingCode.code);
      }
      
      addAgentMessage('completion', `Code applied successfully, Sir! Anything else you need?`);
      setShowConfirmation(false);
      setPendingCode(null);
    }
  };

  const handleRejectCode = () => {
    addAgentMessage('question', `No problem, Sir! Would you like me to generate different code or help with something else?`);
    setShowConfirmation(false);
    setPendingCode(null);
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (transcript && !isListening && transcript.trim().length > 0) {
      handleVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Left Sidebar - Activity Bar */}
      <div className="w-14 glass-effect border-r border-white/10 flex flex-col">
        <div className="flex-1 p-2 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className={`w-10 h-10 p-0 button-ripple transition-all duration-200 ${
              activeTab === "extensions" ? "bg-blue-500/20 neon-glow" : "hover:bg-white/10"
            }`}
            onClick={() => setActiveTab("extensions")}
          >
            <Package className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`w-10 h-10 p-0 button-ripple transition-all duration-200 ${
              activeTab === "files" ? "bg-blue-500/20 neon-glow" : "hover:bg-white/10"
            }`}
            onClick={() => setActiveTab("files")}
          >
            <Folder className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`w-10 h-10 p-0 button-ripple transition-all duration-200 ${
              activeTab === "voice" ? "bg-blue-500/20 neon-glow" : "hover:bg-white/10"
            }`}
            onClick={() => setActiveTab("voice")}
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`w-10 h-10 p-0 button-ripple transition-all duration-200 ${
              activeTab === "terminal" ? "bg-blue-500/20 neon-glow" : "hover:bg-white/10"
            }`}
            onClick={() => {
              setActiveTab("terminal");
              setShowTerminal(true);
            }}
          >
            <Terminal className="w-5 h-5" />
          </Button>
        </div>
        
        {/* AI Assistant Indicator */}
        <div className="p-2 border-t border-white/10">
          <div className={`w-10 h-10 rounded-lg glass-effect flex items-center justify-center ${
            isAgentActive ? 'voice-pulse' : ''
          }`}>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 glass-effect border-r border-white/10 flex flex-col">
        {activeTab === "files" && (
          <EnhancedFileExplorer
            fileExplorer={fileExplorer}
            setFileExplorer={setFileExplorer}
            currentFile={currentFile}
            setCurrentFile={setCurrentFile}
            codeEditor={codeEditor}
            setCodeEditor={setCodeEditor}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
          />
        )}
        
        {activeTab === "voice" && (
          <EnhancedVoiceInterface
            isListening={isListening}
            onToggleListening={toggleRecording}
            transcript={transcript}
            confidence={0.8}
            detectedLanguage={detectedLanguage}
            isProcessing={isGenerating}
            onManualSubmit={handleManualVoiceCommand}
          />
        )}
        
        {activeTab === "extensions" && (
          <Card className="glass-effect border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center">
                  <Mic className="w-3 h-3 text-white" />
                </div>
                <span>VoiceDev X</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600 text-white">Ready</Badge>
                  <Badge className="bg-blue-600 text-white">100% FREE</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="text-green-400">• Voice-driven coding assistant</div>
                  <div className="text-green-400">• Multi-language support</div>
                  <div className="text-green-400">• Real-time file creation</div>
                  <div className="text-green-400">• Code execution terminal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 glass-effect border-b border-white/10 flex items-center px-4">
          <div className="flex items-center space-x-2">
            {currentFile && (
              <>
                <FileText className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">{currentFile.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {currentFile.language || selectedLanguage}
                </Badge>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTerminal(!showTerminal)}
              className={`h-7 px-3 text-xs button-ripple ${
                showTerminal ? 'bg-blue-500/20 neon-glow' : 'hover:bg-white/10'
              }`}
            >
              <Terminal className="w-3 h-3 mr-1" />
              Terminal
            </Button>
          </div>
        </div>

        {/* Code Editor and Terminal */}
        <div className="flex-1 flex">
          <div className={`${showTerminal ? 'w-1/2' : 'w-full'} relative`}>
            {currentFile ? (
              <>
                <Textarea
                  value={codeEditor}
                  onChange={(e) => {
                    setCodeEditor(e.target.value);
                    // Update file content in explorer
                    setFileExplorer(prev => prev.map(file => 
                      file.id === currentFile.id ? { ...file, content: e.target.value } : file
                    ));
                    setCurrentFile({ ...currentFile, content: e.target.value });
                  }}
                  className="w-full h-full bg-transparent border-0 text-gray-100 font-mono text-sm resize-none p-4 focus:outline-none focus:ring-0"
                  placeholder="// Start coding or use voice commands..."
                  style={{ 
                    lineHeight: '1.6',
                    tabSize: 2
                  }}
                />
                
                {/* Run Code Button */}
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    onClick={() => setShowTerminal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3 button-ripple"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Start Coding with Your Voice</h2>
                  <p className="text-gray-400 text-sm max-w-md mb-4">
                    Create files, generate code, and execute your programs using voice commands
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <Button 
                      onClick={() => setActiveTab("files")}
                      className="bg-blue-600 hover:bg-blue-700 button-ripple"
                    >
                      <FilePlus className="w-4 h-4 mr-2" />
                      Create File
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("voice")}
                      className="bg-purple-600 hover:bg-purple-700 button-ripple"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Voice Command
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Terminal Panel */}
          {showTerminal && (
            <div className="w-1/2">
              <EnhancedCodeTerminal
                code={codeEditor}
                language={currentFile?.language || selectedLanguage.toLowerCase()}
                fileName={currentFile?.name || 'untitled'}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Chat */}
      {isAgentActive && (
        <div className="fixed bottom-4 right-4 w-80 glass-effect rounded-lg shadow-2xl border border-purple-500/30">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium gradient-text">Dev X Assistant</span>
                <Badge variant="outline" className="text-xs">Online</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-white/10"
                onClick={() => setIsAgentActive(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <ScrollArea className="max-h-40 space-y-2 mb-3">
              {agentMessages.slice(-3).map((msg, index) => (
                <div key={index} className="flex items-start space-x-2 slide-in-up">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    msg.type === 'greeting' ? 'bg-blue-400' :
                    msg.type === 'confirmation' ? 'bg-yellow-400' :
                    msg.type === 'completion' ? 'bg-green-400' :
                    'bg-purple-400'
                  }`}></div>
                  <span className="text-xs text-white/90 flex-1">{msg.message}</span>
                </div>
              ))}
            </ScrollArea>

            <div className="border-t border-white/20 pt-2">
              <div className="text-xs text-white/70 mb-1">Voice Commands Available:</div>
              <div className="text-xs text-white/60">• File/Folder creation with extensions</div>
              <div className="text-xs text-white/60">• Code generation & execution</div>
              <div className="text-xs text-white/60">• Manual file editing in explorer</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && pendingCode && (
        <ConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          code={pendingCode.code}
          language={pendingCode.language}
          fileName={pendingCode.fileName}
          onApprove={handleApproveCode}
          onReject={handleRejectCode}
        />
      )}
    </div>
  );
}