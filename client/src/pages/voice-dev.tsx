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
  FolderPlus, FilePlus, MoreHorizontal, ChevronRight, ChevronDown, Rocket, Edit
} from "lucide-react";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useCodeGeneration } from "@/hooks/use-code-generation";
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/confirmation-dialog";

interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: string;
  children?: FileStructure[];
}

interface AgentMessage {
  type: 'greeting' | 'confirmation' | 'question' | 'completion';
  message: string;
  timestamp?: number;
}

interface PendingCode {
  code: string;
  language: string;
  fileName: string;
  confidence: number;
}

interface ActionHistory {
  id: string;
  type: 'file_created' | 'folder_created' | 'function_added' | 'code_modified';
  target: string;
  timestamp: number;
  details: any;
}

export default function VoiceDevPage() {
  const [activeTab, setActiveTab] = useState("extensions");
  const [currentFile, setCurrentFile] = useState<FileStructure | null>(null);
  const [codeEditor, setCodeEditor] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [pendingCode, setPendingCode] = useState<PendingCode | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [agentMessages, setAgentMessages] = useState([
    { type: 'greeting', message: "Hello Sir! I'm your AI coding assistant. What would you like me to help you with today?" }
  ]);
  const [debugOutput, setDebugOutput] = useState("");
  const [isDebugging, setIsDebugging] = useState(false);
  const [fileExplorer, setFileExplorer] = useState<FileStructure[]>([
    { id: '1', name: 'src', type: 'folder' as const, path: 'src', children: [] },
    { id: '2', name: 'components', type: 'folder' as const, path: 'components', children: [] }
  ]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1', '2']);
  
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

  // Update editable transcript when transcript changes
  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  // Process voice commands and detect language
  useEffect(() => {
    if (transcript && !isListening && transcript.trim().length > 0) {
      // Detect language from voice input
      detectVoiceLanguage(transcript);
      handleVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  const detectVoiceLanguage = (text: string) => {
    // Simple language detection based on common patterns
    if (/[\u0600-\u06FF]/.test(text)) {
      setDetectedLanguage("Arabic");
    } else if (/[\u0900-\u097F]/.test(text)) {
      setDetectedLanguage("Hindi");
    } else if (/[\u0627-\u06FF]/.test(text)) {
      setDetectedLanguage("Urdu");
    } else if (/hola|gracias|por favor/.test(text.toLowerCase())) {
      setDetectedLanguage("Spanish");
    } else if (/bonjour|merci|s'il vous plaît/.test(text.toLowerCase())) {
      setDetectedLanguage("French");
    } else {
      setDetectedLanguage("English");
    }
  };

  // Voice synthesis for assistant
  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const addAgentMessage = (type: AgentMessage['type'], message: string) => {
    setAgentMessages(prev => [...prev, { type, message, timestamp: Date.now() }]);
    speakMessage(message); // Make assistant speak
  };

  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Rollback/Undo commands - delete recent creations
    if ((lowerCommand.includes('delete') || lowerCommand.includes('remove')) && 
        (lowerCommand.includes('file') || lowerCommand.includes('folder'))) {
      
      // Check if referring to recently created items
      if (lowerCommand.includes('that') || lowerCommand.includes('it') || lowerCommand.includes('this') || 
          lowerCommand.includes('last') || lowerCommand.includes('recent')) {
        const recentAction = actionHistory.slice(-1)[0];
        if (recentAction && (recentAction.type === 'file_created' || recentAction.type === 'folder_created')) {
          deleteFileOrFolder(recentAction.target);
          removeFromHistory(recentAction.id);
          addAgentMessage('completion', `"${recentAction.target}" deleted as requested, Sir! What's next?`);
          return;
        }
      }
      
      // Extract specific filename
      const fileName = extractFileNameForDeletion(command);
      if (fileName) {
        deleteFileOrFolder(fileName);
        removeFromHistory(fileName);
        addAgentMessage('completion', `"${fileName}" deleted successfully, Sir! What would you like me to do next?`);
      } else {
        addAgentMessage('question', `I couldn't identify which file to delete, Sir. Could you specify the exact filename?`);
      }
      return;
    }

    // Rename commands
    if (lowerCommand.includes('rename') || lowerCommand.includes('change') && lowerCommand.includes('name')) {
      const renameResult = handleRenameCommand(command);
      if (renameResult.success) {
        addAgentMessage('completion', `Successfully renamed "${renameResult.oldName}" to "${renameResult.newName}", Sir!`);
      } else {
        addAgentMessage('question', `I couldn't understand the rename command, Sir. Please specify old and new names clearly.`);
      }
      return;
    }

    // Function modification commands
    if ((lowerCommand.includes('change') || lowerCommand.includes('modify') || lowerCommand.includes('update')) && 
        lowerCommand.includes('function')) {
      const functionResult = handleFunctionModification(command);
      if (functionResult.success) {
        addAgentMessage('completion', `Function modified successfully, Sir! The changes have been applied.`);
      } else {
        addAgentMessage('question', `I need more details about which function to modify, Sir. Could you be more specific?`);
      }
      return;
    }
    
    // File/Folder creation commands - enhanced patterns
    if (lowerCommand.includes('folder') && (lowerCommand.includes('create') || lowerCommand.includes('make') || lowerCommand.includes('new'))) {
      const folderName = extractFileName(command, 'folder');
      createNewFolder(folderName);
      addAgentMessage('completion', `Folder "${folderName}" created successfully, Sir! What would you like me to do next?`);
      return;
    }
    
    if (lowerCommand.includes('file') && (lowerCommand.includes('create') || lowerCommand.includes('make') || lowerCommand.includes('new'))) {
      const fileName = extractFileName(command, 'file');
      const language = detectLanguageFromFileName(fileName);
      createNewFile(fileName, language);
      addAgentMessage('completion', `File "${fileName}" created successfully, Sir! Ready for your next command.`);
      return;
    }
    
    // Code modification commands - enhanced
    if ((lowerCommand.includes('change') || lowerCommand.includes('modify') || lowerCommand.includes('update')) && 
        !lowerCommand.includes('line') && currentFile) {
      addAgentMessage('confirmation', `I'll help you modify the code, Sir. Generating changes now...`);
      
      try {
        const result = await generateCode(command, selectedLanguage.toLowerCase(), currentFile.name);
        // Apply changes to current file - this will update both editor and explorer
        applyCodeChanges(result.code);
        addAgentMessage('completion', `Code changes applied successfully, Sir! What's next?`);
      } catch (error) {
        addAgentMessage('question', `I couldn't apply the changes, Sir. Could you be more specific?`);
      }
      return;
    }
    
    // Code editing commands - enhanced
    if ((lowerCommand.includes('remove') || lowerCommand.includes('delete')) && lowerCommand.includes('function')) {
      const functionName = extractFunctionName(command);
      removeFunctionFromCode(functionName);
      addAgentMessage('completion', `Function "${functionName}" removed, Sir! Anything else you need?`);
      return;
    }
    
    if ((lowerCommand.includes('replace') || lowerCommand.includes('change') || lowerCommand.includes('update')) && lowerCommand.includes('function')) {
      const functionName = extractFunctionName(command);
      addAgentMessage('confirmation', `I'll replace function "${functionName}", Sir. Generating new version...`);
      
      try {
        const result = await generateCode(command, selectedLanguage.toLowerCase(), currentFile?.name || 'untitled');
        // Replace specific function in the code
        replaceFunctionInCode(functionName, result.code);
        addAgentMessage('completion', `Function "${functionName}" replaced successfully, Sir! What's next?`);
      } catch (error) {
        addAgentMessage('question', `Couldn't replace the function, Sir. Could you try rephrasing?`);
      }
      return;
    }
    
    // Line editing commands
    if (lowerCommand.includes('change line') || lowerCommand.includes('edit line') || lowerCommand.includes('modify line')) {
      const lineNumber = extractLineNumber(command);
      const newContent = extractNewLineContent(command);
      changeLineInCode(lineNumber, newContent);
      addAgentMessage('completion', `Line ${lineNumber} updated, Sir! What's next?`);
      return;
    }
    
    // Debug commands
    if (lowerCommand.includes('debug') || lowerCommand.includes('run code') || lowerCommand.includes('execute')) {
      debugCode();
      return;
    }
    
    // Code generation
    try {
      addAgentMessage('confirmation', `Processing your request, Sir. Let me generate the code for you.`);
      const result = await generateCode(command, selectedLanguage.toLowerCase(), currentFile?.name || 'untitled');
      setPendingCode(result);
      setShowConfirmation(true);
    } catch (error) {
      addAgentMessage('question', `I apologize, Sir. I couldn't process that command. Could you please rephrase it?`);
      toast({
        title: "Command Failed",
        description: "I couldn't process that command. Please try again.",
        variant: "destructive",
      });
    }
  };

  const extractFileName = (command: string, type: 'file' | 'folder'): string => {
    let fileName = '';
    let fileType = '';
    
    if (type === 'file') {
      // Enhanced patterns for file creation with type detection
      const filePatterns = [
        // "make a file of css with name of style" -> style.css
        /make\s+(?:a\s+)?file\s+of\s+(\w+)\s+with\s+name\s+(?:of\s+)?(.+)/i,
        // "create css file named style" -> style.css
        /create\s+(\w+)\s+file\s+named\s+(.+)/i,
        // "make a javascript file called app" -> app.js
        /make\s+(?:a\s+)?(\w+)\s+file\s+called\s+(.+)/i,
        // "create file style.css" -> style.css (already has extension)
        /(?:create|make|new)\s+file\s+(.+)/i,
        // Basic patterns
        /(?:create|make|new)\s+(.+)\s+file/i
      ];
      
      for (const pattern of filePatterns) {
        const match = command.match(pattern);
        if (match) {
          if (match.length === 3 && match[1] && match[2]) {
            // Pattern with file type and name
            fileType = match[1].toLowerCase();
            fileName = match[2].trim();
          } else if (match[1]) {
            // Simple file name
            fileName = match[1].trim();
          }
          break;
        }
      }
      
      // Add appropriate extension based on file type or detect from name
      if (fileName) {
        // If filename already has extension, keep it
        if (fileName.includes('.')) {
          return fileName;
        }
        
        // Add extension based on detected file type
        const extension = getFileExtension(fileType || detectLanguageFromContext(command));
        return `${fileName}${extension}`;
      }
    } else {
      // Folder patterns
      const folderPatterns = [
        /(?:create|make|new)\s+folder\s+['"](.*?)['"]/, // "create folder 'my folder'"
        /(?:create|make|new)\s+folder\s+(.+)/,          // "create folder myfolder"
        /(?:create|make|new)\s+(.+)\s+folder/,          // "create myfolder folder"
      ];
      
      for (const pattern of folderPatterns) {
        const match = command.match(pattern);
        if (match && (match[1] || match[2])) {
          return (match[1] || match[2]).trim();
        }
      }
    }
    
    return fileName || `new_${type}_${Date.now()}`;
  };

  const getFileExtension = (language: string): string => {
    const extensions: { [key: string]: string } = {
      'css': '.css',
      'html': '.html',
      'javascript': '.js',
      'js': '.js',
      'typescript': '.ts',
      'ts': '.ts',
      'python': '.py',
      'py': '.py',
      'java': '.java',
      'cpp': '.cpp',
      'c++': '.cpp',
      'csharp': '.cs',
      'cs': '.cs',
      'go': '.go',
      'rust': '.rs',
      'php': '.php',
      'ruby': '.rb',
      'json': '.json',
      'xml': '.xml',
      'yaml': '.yaml',
      'yml': '.yml',
      'md': '.md',
      'markdown': '.md',
      'txt': '.txt'
    };
    
    return extensions[language.toLowerCase()] || '.txt';
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

  const extractFileNameForDeletion = (command: string): string => {
    // Enhanced patterns to better capture file names
    const patterns = [
      // "delete file style.css" or "delete the file style.css"
      /(?:delete|remove)\s+(?:the\s+)?file\s+(.+)/i,
      // "delete folder components" or "delete the folder components"
      /(?:delete|remove)\s+(?:the\s+)?folder\s+(.+)/i,
      // "remove style.css file" or "remove the style.css file"
      /(?:delete|remove)\s+(?:the\s+)?(.+?)\s+(?:file|folder)/i,
      // Last resort: "delete style.css"
      /(?:delete|remove)\s+(?:the\s+)?(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match && match[1]) {
        let fileName = match[1].trim();
        // Remove common words that might be captured
        fileName = fileName.replace(/\b(file|folder|the|a|an)\b/gi, '').trim();
        if (fileName && fileName.length > 0) {
          return fileName;
        }
      }
    }
    
    return '';
  };

  const deleteFileOrFolder = (name: string) => {
    if (!name) return;
    
    // Find exact match or partial match for deletion
    const itemToDelete = fileExplorer.find(item => 
      item.name === name || 
      item.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(item.name.toLowerCase())
    );
    
    if (itemToDelete) {
      // Remove from file explorer
      setFileExplorer(prev => prev.filter(item => item.id !== itemToDelete.id));
      
      // If currently open file is being deleted, close it
      if (currentFile && currentFile.id === itemToDelete.id) {
        setCurrentFile(null);
        setCodeEditor('');
      }
      
      toast({
        title: "File Deleted",
        description: `"${itemToDelete.name}" has been removed successfully.`,
      });
    } else {
      toast({
        title: "File Not Found",
        description: `Could not find "${name}" to delete.`,
        variant: "destructive",
      });
    }
  };

  const replaceFunctionInCode = (functionName: string, newCode: string) => {
    if (!currentFile || !currentFile.content) return;
    
    // Enhanced function replacement for multiple languages
    const lines = currentFile.content.split('\n');
    const newLines = [];
    let inFunction = false;
    let braceCount = 0;
    let indentLevel = 0;
    let functionReplaced = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Detect function start
      if (trimmedLine.includes(`function ${functionName}`) || 
          trimmedLine.includes(`def ${functionName}`) || 
          trimmedLine.includes(`${functionName}(`) ||
          trimmedLine.includes(`public ${functionName}`) ||
          trimmedLine.includes(`private ${functionName}`)) {
        inFunction = true;
        braceCount = 0;
        indentLevel = line.length - line.trimStart().length;
        
        // Insert new function code
        if (!functionReplaced) {
          newLines.push(newCode);
          functionReplaced = true;
        }
        continue;
      }
      
      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        // For Python, check indentation
        const currentIndent = line.length - line.trimStart().length;
        if (currentFile.language === 'python' && trimmedLine && currentIndent <= indentLevel) {
          inFunction = false;
          newLines.push(line);
        } else if (braceCount <= 0 && trimmedLine.endsWith('}')) {
          inFunction = false;
        }
        // Skip old function lines
      } else {
        newLines.push(line);
      }
    }
    
    const updatedContent = newLines.join('\n');
    setCodeEditor(updatedContent);
    setCurrentFile({ ...currentFile, content: updatedContent });
    
    // Update file in explorer
    setFileExplorer(prev => prev.map(item => 
      item.id === currentFile.id ? { ...item, content: updatedContent } : item
    ));
  };

  const applyCodeChanges = (newCode: string) => {
    if (!currentFile) return;
    
    // Update the code editor
    setCodeEditor(newCode);
    
    // Update current file state
    const updatedFile = { ...currentFile, content: newCode };
    setCurrentFile(updatedFile);
    
    // Update file in explorer to maintain sync
    setFileExplorer(prev => prev.map(item => 
      item.id === currentFile.id ? { ...item, content: newCode } : item
    ));
    
    // Show visual feedback
    toast({
      title: "Code Updated",
      description: "Your file has been modified successfully.",
    });
  };

  const extractFunctionName = (command: string): string => {
    const match = command.match(/function\s+(\w+)|(\w+)\s+function/i);
    return match ? (match[1] || match[2]) : 'unknownFunction';
  };

  const detectLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'ts': return 'typescript';
      case 'cpp': case 'c++': return 'cpp';
      case 'cs': return 'csharp';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'html': return 'html';
      case 'css': return 'css';
      default: return 'javascript';
    }
  };

  const extractLineNumber = (command: string): number => {
    const match = command.match(/line\s+(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  };

  const extractNewLineContent = (command: string): string => {
    const match = command.match(/(?:to|with)\s+"([^"]+)"/i) || command.match(/(?:to|with)\s+(.+)/i);
    return match ? match[1].trim() : '';
  };

  const changeLineInCode = (lineNumber: number, newContent: string) => {
    if (!currentFile || !currentFile.content) return;
    
    const lines = currentFile.content.split('\n');
    if (lineNumber > 0 && lineNumber <= lines.length) {
      lines[lineNumber - 1] = newContent;
      const updatedContent = lines.join('\n');
      setCodeEditor(updatedContent);
      setCurrentFile({ ...currentFile, content: updatedContent });
      
      // Update file in explorer
      setFileExplorer(prev => prev.map(item => 
        item.id === currentFile.id ? { ...item, content: updatedContent } : item
      ));
    }
  };

  const removeFunctionFromCode = (functionName: string) => {
    if (!currentFile || !currentFile.content) return;
    
    // Enhanced function removal for multiple languages
    const lines = currentFile.content.split('\n');
    const newLines = [];
    let inFunction = false;
    let braceCount = 0;
    let indentLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Detect function start (JavaScript, Python, Java, etc.)
      if (trimmedLine.includes(`function ${functionName}`) || 
          trimmedLine.includes(`def ${functionName}`) || 
          trimmedLine.includes(`${functionName}(`) ||
          trimmedLine.includes(`public ${functionName}`) ||
          trimmedLine.includes(`private ${functionName}`)) {
        inFunction = true;
        braceCount = 0;
        indentLevel = line.length - line.trimStart().length;
        continue;
      }
      
      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        // For Python, check indentation
        const currentIndent = line.length - line.trimStart().length;
        if (currentFile.language === 'python' && trimmedLine && currentIndent <= indentLevel) {
          inFunction = false;
          newLines.push(line);
        } else if (braceCount <= 0 && trimmedLine.endsWith('}')) {
          inFunction = false;
        }
      } else {
        newLines.push(line);
      }
    }
    
    const updatedContent = newLines.join('\n');
    setCodeEditor(updatedContent);
    setCurrentFile({ ...currentFile, content: updatedContent });
    
    // Update file in explorer
    setFileExplorer(prev => prev.map(item => 
      item.id === currentFile.id ? { ...item, content: updatedContent } : item
    ));
  };

  const handleApproveCode = () => {
    if (pendingCode) {
      if (!currentFile) {
        // Create new file if none exists
        const newFile: FileStructure = {
          id: Date.now().toString(),
          name: pendingCode.fileName,
          type: 'file',
          path: pendingCode.fileName,
          language: pendingCode.language,
          content: pendingCode.code
        };
        setCurrentFile(newFile);
        setCodeEditor(pendingCode.code);
        
        // Add to file explorer
        setFileExplorer(prev => [...prev, newFile]);
        
        // Track this action
        addToHistory('file_created', pendingCode.fileName, { 
          language: pendingCode.language, 
          id: newFile.id,
          code: pendingCode.code
        });

      } else {
        // Add to existing file
        const updatedContent = currentFile.content + '\n\n' + pendingCode.code;
        const updatedFile = { ...currentFile, content: updatedContent };
        setCurrentFile(updatedFile);
        setCodeEditor(updatedContent);
        
        // Track code addition
        addToHistory('code_modified', currentFile.name, {
          action: 'code_added',
          newCode: pendingCode.code
        });
      }
      
      addAgentMessage('completion', `Perfect! Code has been applied successfully, Sir. What's our next move?`);
      toast({
        title: "Code Applied",
        description: `Code has been added successfully`,
      });
    }
    
    setPendingCode(null);
    setShowConfirmation(false);
  };

  const handleRejectCode = () => {
    setPendingCode(null);
    setShowConfirmation(false);
    
    addAgentMessage('question', `No problem, Sir! The code has been rejected. What would you like me to do instead?`);
    toast({
      title: "Code Rejected",
      description: "I'll wait for your next command.",
    });
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const createNewFolder = (name: string) => {
    const newFolder: FileStructure = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      path: name,
      children: []
    };
    setFileExplorer(prev => [...prev, newFolder]);
    
    // Track this action
    addToHistory('folder_created', name, { id: newFolder.id });
  };

  const handleRenameCommand = (command: string) => {
    const renamePattern = /rename\s+(?:file\s+|folder\s+)?["']?([^"'\s]+)["']?\s+to\s+["']?([^"'\s]+)["']?/i;
    const changePattern = /change\s+(?:the\s+)?name\s+of\s+["']?([^"'\s]+)["']?\s+to\s+["']?([^"'\s]+)["']?/i;
    
    let match = command.match(renamePattern) || command.match(changePattern);
    
    if (match) {
      const oldName = match[1];
      const newName = match[2];
      
      // Find and rename the file/folder
      setFileExplorer(prev => prev.map(item => {
        if (item.name === oldName) {
          const updated = { ...item, name: newName, path: newName };
          if (currentFile?.name === oldName) {
            setCurrentFile(updated);
          }
          return updated;
        }
        return item;
      }));
      
      return { success: true, oldName, newName };
    }
    
    return { success: false };
  };

  const handleFunctionModification = (command: string) => {
    if (!currentFile || !currentFile.content) {
      return { success: false, error: 'No file open' };
    }

    // Extract function name to modify
    const functionPattern = /(?:change|modify|update)\s+(?:the\s+)?function\s+["']?([^"'\s]+)["']?/i;
    const match = command.match(functionPattern);
    
    if (match) {
      const functionName = match[1];
      const content = currentFile.content;
      
      // Simple function name replacement for demonstration
      if (content.includes(functionName)) {
        // This is a simplified implementation - in reality, you'd want more sophisticated parsing
        const newContent = content.replace(
          new RegExp(`function\\s+${functionName}`, 'g'),
          `function modified_${functionName}`
        );
        
        setCodeEditor(newContent);
        setCurrentFile({ ...currentFile, content: newContent });
        
        // Update in file explorer
        setFileExplorer(prev => prev.map(item => 
          item.id === currentFile.id ? { ...item, content: newContent } : item
        ));
        
        addToHistory('function_added', functionName, { action: 'modified' });
        return { success: true };
      }
    }
    
    return { success: false };
  };

  const exampleCommands = {
    functions: "Create a function that adds two numbers",
    files: "Create a Java file named Calculator", 
    classes: "Generate a user class with properties"
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

  const removeFromHistory = (targetOrId: string) => {
    setActionHistory(prev => prev.filter(action => 
      action.id !== targetOrId && action.target !== targetOrId
    ));
  };

  const createNewFile = (name: string, language: string) => {
    const newFile: FileStructure = {
      id: Date.now().toString(),
      name,
      type: 'file',
      path: name,
      language,
      content: ''
    };
    setCurrentFile(newFile);
    setCodeEditor('');
    setSelectedLanguage(language.charAt(0).toUpperCase() + language.slice(1));
    setFileExplorer(prev => [...prev, newFile]);
    
    // Track this action
    addToHistory('file_created', name, { language, id: newFile.id });
  };

  const debugCode = async () => {
    if (!currentFile || !currentFile.content) {
      addAgentMessage('question', `Sir, there's no code to debug. Would you like to create a file first?`);
      return;
    }
    
    setIsDebugging(true);
    addAgentMessage('confirmation', `Analyzing and debugging your code, Sir. Please wait...`);
    
    try {
      // Simulate code execution and debugging
      const lines = currentFile.content.split('\n');
      let output = '';
      let debugInfo = '';
      
      // Simple execution simulation
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('console.log') || line.includes('print')) {
          const match = line.match(/["'`](.*?)["'`]/);
          if (match) {
            output += `Line ${i + 1}: ${match[1]}\n`;
          }
        }
      }
      
      // Debug analysis
      debugInfo = `Debug Analysis:\n`;
      debugInfo += `- Total lines: ${lines.length}\n`;
      debugInfo += `- Functions found: ${(currentFile.content.match(/function|def|public.*{/g) || []).length}\n`;
      debugInfo += `- Variables declared: ${(currentFile.content.match(/let|var|const|int|string/g) || []).length}\n`;
      
      if (currentFile.content.includes('function') && !currentFile.content.includes('return')) {
        debugInfo += `- Warning: Function may be missing return statement\n`;
      }
      
      setDebugOutput(`Execution Output:\n${output}\n${debugInfo}`);
      addAgentMessage('completion', `Code debugging completed, Sir! Check the debug output. Any issues you'd like me to fix?`);
      
    } catch (error) {
      addAgentMessage('question', `Sir, I encountered an issue while debugging. Would you like me to analyze the code differently?`);
    } finally {
      setIsDebugging(false);
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFileExplorer = (items: FileStructure[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ marginLeft: `${depth * 12}px` }}>
        <div 
          className={`flex items-center space-x-2 p-1 rounded cursor-pointer hover:bg-[#333333] ${
            currentFile?.id === item.id ? 'bg-[#094771] border border-[#007acc]' : ''
          }`}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolderExpansion(item.id);
            } else {
              setCurrentFile(item);
              setCodeEditor(item.content || '');
              if (item.language) {
                setSelectedLanguage(item.language.charAt(0).toUpperCase() + item.language.slice(1));
              }
            }
          }}
        >
          {item.type === 'folder' ? (
            <>
              {expandedFolders.includes(item.id) ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
              <Folder className="w-3 h-3 text-blue-400" />
            </>
          ) : (
            <FileText className={`w-3 h-3 ${
              item.language === 'javascript' ? 'text-yellow-400' :
              item.language === 'python' ? 'text-green-400' :
              item.language === 'java' ? 'text-orange-400' : 'text-blue-400'
            }`} />
          )}
          <span className="text-xs text-gray-300">{item.name}</span>
        </div>
        
        {item.type === 'folder' && expandedFolders.includes(item.id) && item.children && (
          <div className="ml-2">
            {renderFileExplorer(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderSidePanel = () => {
    switch (activeTab) {
      case "extensions":
        return (
          <>
            {/* Extension Header */}
            <div className="p-3 border-b border-[#2d2d2d]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center">
                  <Mic className="w-3 h-3 text-white" />
                </div>
                <h1 className="text-sm font-semibold text-white">VoiceDev X</h1>
              </div>
              <p className="text-xs text-gray-400">Free AI-Powered Voice Coding</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="text-xs bg-green-600 text-white border-green-600 px-2 py-0.5">
                  Ready
                </Badge>
                <Badge className="text-xs bg-blue-600 text-white border-blue-600 px-2 py-0.5">
                  100% FREE
                </Badge>
              </div>
              <div className="mt-2 text-xs text-green-400">
                • Persistent AI agent assistant
              </div>
              <div className="text-xs text-green-400">
                • No API keys or subscriptions needed
              </div>
            </div>

            {/* Voice Settings */}
            <div className="p-3 border-b border-[#2d2d2d]">
              <h3 className="text-sm text-gray-300 mb-3">Voice Settings</h3>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Voice Recognition</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowLanguageSettings(!showLanguageSettings)}
                  >
                    <Settings className="w-3 h-3 text-gray-400" />
                  </Button>
                </div>
                
                {showLanguageSettings && (
                  <div className="space-y-2 p-2 bg-[#1e1e1e] rounded border border-[#3e3e3e]">
                    <div className="text-xs text-gray-400 mb-2">Supported Languages:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {supportedVoiceLanguages.map((lang) => (
                        <div
                          key={lang.code}
                          className={`p-1 rounded text-xs cursor-pointer border ${
                            voiceLanguage === lang.code 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-[#2d2d2d] border-[#3e3e3e] text-gray-300 hover:bg-[#333333]'
                          }`}
                          onClick={() => setVoiceLanguage(lang.code)}
                        >
                          <span className="mr-1">{lang.flag}</span>
                          {lang.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={toggleRecording}
                className={`w-full h-10 rounded ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium`}
              >
                <Mic className="w-4 h-4 mr-2" />
                {isListening ? 'Recording...' : 'Start Voice Input'}
              </Button>

              {transcript && (
                <div className="mt-3 p-2 bg-[#1e1e1e] rounded border border-[#3e3e3e] text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">Detected: {detectedLanguage}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">{voiceLanguage}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-blue-400 hover:text-blue-300"
                        onClick={() => setShowTranscriptEditor(!showTranscriptEditor)}
                        title="Edit transcript"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {showTranscriptEditor ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editableTranscript}
                        onChange={(e) => setEditableTranscript(e.target.value)}
                        className="w-full bg-[#2d2d2d] border border-[#3e3e3e] text-gray-300 text-xs p-2 rounded resize-none"
                        rows={3}
                        placeholder="Edit your voice command here..."
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-gray-400 hover:text-gray-300"
                          onClick={() => {
                            setShowTranscriptEditor(false);
                            setEditableTranscript(transcript);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-6 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            handleVoiceCommand(editableTranscript);
                            setShowTranscriptEditor(false);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-300">"{transcript}"</span>
                  )}
                </div>
              )}
            </div>

            {/* Voice Command Examples */}
            <div className="p-3 border-b border-[#2d2d2d]">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Voice Commands:</h3>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 mb-1">Files & Folders:</div>
                <div className="text-xs text-gray-400 pl-2">• "Create folder components"</div>
                <div className="text-xs text-gray-400 pl-2">• "Make a file of css with name of style" → style.css</div>
                <div className="text-xs text-gray-400 pl-2">• "Create javascript file named app" → app.js</div>
                
                <div className="text-xs text-gray-500 mb-1 mt-2">File Management:</div>
                <div className="text-xs text-gray-400 pl-2">• "Delete file style.css"</div>
                <div className="text-xs text-gray-400 pl-2">• "Remove folder components"</div>
                
                <div className="text-xs text-gray-500 mb-1 mt-2">Code Editing:</div>
                <div className="text-xs text-gray-400 pl-2">• "Change the code to use arrow functions"</div>
                <div className="text-xs text-gray-400 pl-2">• "Replace function calculateTotal with..."</div>
                <div className="text-xs text-gray-400 pl-2">• "Change line 5 to console.log('hello')"</div>
                <div className="text-xs text-gray-400 pl-2">• "Debug code" or "Run code"</div>
                
                <div className="text-xs text-gray-500 mb-1 mt-2">Generation:</div>
                <div className="text-xs text-gray-400 pl-2">• "Create a login function"</div>
                <div className="text-xs text-gray-400 pl-2">• "Generate a user class"</div>
              </div>
            </div>

            {/* Programming Language Selector */}
            <div className="p-3 border-b border-[#2d2d2d]">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Programming Language</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {supportedProgrammingLanguages.map((lang) => (
                  <div
                    key={lang.name}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                      selectedLanguage === lang.name 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-[#2d2d2d] hover:bg-[#333333] text-gray-300'
                    }`}
                    onClick={() => setSelectedLanguage(lang.name)}
                  >
                    <span className="text-sm">{lang.icon}</span>
                    <span className="text-xs">{lang.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Command Examples */}
            <div className="flex-1 p-3">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Voice Command Examples</h3>
              <div className="space-y-2">
                <div className="p-2 bg-[#1e1e1e] rounded border border-[#3e3e3e]">
                  <div className="text-xs font-medium text-blue-400 mb-1">Functions:</div>
                  <div className="text-xs text-gray-400">{exampleCommands.functions}</div>
                </div>
                
                <div className="p-2 bg-[#1e1e1e] rounded border border-[#3e3e3e]">
                  <div className="text-xs font-medium text-green-400 mb-1">Files:</div>
                  <div className="text-xs text-gray-400">{exampleCommands.files}</div>
                </div>
                
                <div className="p-2 bg-[#1e1e1e] rounded border border-[#3e3e3e]">
                  <div className="text-xs font-medium text-purple-400 mb-1">Classes:</div>
                  <div className="text-xs text-gray-400">{exampleCommands.classes}</div>
                </div>
              </div>
            </div>
          </>
        );

      case "files":
        return (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Explorer</h3>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => createNewFile(`file_${Date.now()}.js`, 'javascript')}
                >
                  <FilePlus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => createNewFolder(`folder_${Date.now()}`)}
                >
                  <FolderPlus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {renderFileExplorer(fileExplorer)}
            </div>
            
            <div className="mt-4 pt-3 border-t border-[#2d2d2d]">
              <div className="text-xs text-gray-500 mb-2">Voice Commands:</div>
              <div className="text-xs text-gray-400">• "Create folder [name]"</div>
              <div className="text-xs text-gray-400">• "Make a [type] file with name of [name]"</div>
              <div className="text-xs text-gray-400">• "Create [type] file named [name]"</div>
            </div>
          </div>
        );

      case "search":
        return (
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Search</h3>
            <Input 
              placeholder="Search in files..."
              className="bg-[#2d2d2d] border-[#3e3e3e] text-gray-300"
            />
          </div>
        );

      case "code":
        return (
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Source Control</h3>
            <div className="text-xs text-gray-400">
              Git integration coming soon...
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Settings & Debug</h3>
            
            {/* Debug Section */}
            <div className="mb-4">
              <h4 className="text-xs text-gray-400 mb-2">Debug & Run</h4>
              <Button
                onClick={debugCode}
                disabled={isDebugging || !currentFile}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs mb-2"
              >
                <Play className="w-3 h-3 mr-2" />
                {isDebugging ? 'Debugging...' : 'Debug & Run Code'}
              </Button>
              
              {debugOutput && (
                <div className="mt-2 p-2 bg-[#1e1e1e] rounded border border-[#3e3e3e] max-h-40 overflow-y-auto">
                  <div className="text-xs text-gray-400 mb-1">Debug Output:</div>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">{debugOutput}</pre>
                </div>
              )}
            </div>

            {/* Deployment Section */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded border border-blue-500/30">
              <h4 className="text-xs text-white font-semibold mb-2 flex items-center">
                <Rocket className="w-3 h-3 mr-1" />
                Deployment Ready
              </h4>
              <div className="text-xs text-gray-300 space-y-1">
                <div>✓ Frontend: React + Vite + TypeScript</div>
                <div>✓ Backend: Express.js + PostgreSQL</div>
                <div>✓ Database: Drizzle ORM configured</div>
                <div>✓ Voice API: Integrated & working</div>
              </div>
              <Button
                onClick={() => addAgentMessage('completion', 'Deployment guide: Your app is ready for Replit deployment. Simply click the Deploy button in Replit. All configurations are set up, Sir!')}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Rocket className="w-3 h-3 mr-1" />
                Deployment Guide
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xs text-gray-400 mb-2">Supported Languages</h4>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {supportedProgrammingLanguages.map((lang) => (
                    <div key={lang.name} className="flex items-center space-x-2 p-1 bg-[#2d2d2d] rounded">
                      <span className="text-sm">{lang.icon}</span>
                      <span className="text-xs text-gray-300">{lang.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div></div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-100 font-sans">
      {/* VS Code Activity Bar */}
      <div className="w-12 bg-[#2d2d2d] border-r border-[#3e3e3e] flex flex-col items-center py-2 space-y-1">
        <div 
          className={`w-8 h-8 rounded-sm flex items-center justify-center mb-2 cursor-pointer ${
            activeTab === "extensions" ? "bg-[#007acc]" : "hover:bg-[#2d2d2d]"
          }`}
          onClick={() => setActiveTab("extensions")}
        >
          <Package className={`w-5 h-5 ${activeTab === "extensions" ? "text-white" : "text-gray-400"}`} />
        </div>
        <div 
          className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer ${
            activeTab === "files" ? "bg-[#007acc]" : "hover:bg-[#2d2d2d]"
          }`}
          onClick={() => setActiveTab("files")}
        >
          <Folder className={`w-5 h-5 ${activeTab === "files" ? "text-white" : "text-gray-400"}`} />
        </div>
        <div 
          className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer ${
            activeTab === "search" ? "bg-[#007acc]" : "hover:bg-[#2d2d2d]"
          }`}
          onClick={() => setActiveTab("search")}
        >
          <Search className={`w-5 h-5 ${activeTab === "search" ? "text-white" : "text-gray-400"}`} />
        </div>
        <div 
          className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer ${
            activeTab === "code" ? "bg-[#007acc]" : "hover:bg-[#2d2d2d]"
          }`}
          onClick={() => setActiveTab("code")}
        >
          <Code className={`w-5 h-5 ${activeTab === "code" ? "text-white" : "text-gray-400"}`} />
        </div>
        <div 
          className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer ${
            activeTab === "settings" ? "bg-[#007acc]" : "hover:bg-[#2d2d2d]"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings className={`w-5 h-5 ${activeTab === "settings" ? "text-white" : "text-gray-400"}`} />
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 bg-[#252526] border-r border-[#3e3e3e] flex flex-col">
        {renderSidePanel()}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="h-9 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center">
          {currentFile && (
            <div className="flex items-center bg-[#1e1e1e] border-r border-[#2d2d2d] px-3 h-full">
              <FileText className={`w-4 h-4 mr-2 ${
                currentFile.language === 'javascript' ? 'text-yellow-400' :
                currentFile.language === 'python' ? 'text-green-400' :
                currentFile.language === 'java' ? 'text-orange-400' : 'text-blue-400'
              }`} />
              <span className="text-sm text-gray-300">{currentFile.name}</span>
              <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0 hover:bg-[#333333]">
                <X className="w-3 h-3 text-gray-400" />
              </Button>
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          {currentFile ? (
            <>
              <Textarea
                value={codeEditor}
                onChange={(e) => setCodeEditor(e.target.value)}
                className="w-full h-full bg-[#1e1e1e] border-0 text-gray-100 font-mono text-sm resize-none py-4 pl-16 pr-4 focus:outline-none focus:ring-0"
                placeholder="// Start coding or use voice commands..."
                style={{ 
                  lineHeight: '1.4',
                  tabSize: 2
                }}
              />
              
              {/* Line Numbers Overlay */}
              <div className="absolute left-0 top-0 w-12 h-full bg-[#1e1e1e] border-r border-[#2d2d2d] py-4 pl-2 pr-4 text-xs text-gray-500 font-mono select-none pointer-events-none">
                {codeEditor.split('\n').map((_, index) => (
                  <div key={index} className="h-[19.6px] text-right">
                    {index + 1}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Code className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-semibold mb-2 text-gray-300">No File Open</h3>
                <p className="text-sm mb-4 text-gray-400">Create a new file or use voice commands to get started</p>
                <Button 
                  onClick={() => setActiveTab("files")}
                  className="bg-[#007acc] hover:bg-[#005a9e] text-white border-none"
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Create File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jarvis-like AI Assistant Chat (Bottom Right) */}
      {isAgentActive && (
        <div className="fixed bottom-4 right-4 w-80 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-2xl border border-purple-500">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">Dev X Assistant</span>
                <Badge className="text-xs bg-white/20 text-white border-white/20">
                  Online
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => setIsAgentActive(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
              {agentMessages.slice(-3).map((msg, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    msg.type === 'greeting' ? 'bg-blue-400' :
                    msg.type === 'confirmation' ? 'bg-yellow-400' :
                    msg.type === 'completion' ? 'bg-green-400' :
                    'bg-purple-400'
                  }`}></div>
                  <span className="text-xs text-white/90 flex-1">{msg.message}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-2">
              <div className="text-xs text-white/70 mb-1">Voice Commands Available:</div>
              <div className="text-xs text-white/60">• File/Folder creation</div>
              <div className="text-xs text-white/60">• Code generation & editing</div>
              <div className="text-xs text-white/60">• Function removal/replacement</div>
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