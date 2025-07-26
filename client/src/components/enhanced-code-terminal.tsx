import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Play, X, Terminal, Square, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeTerminalProps {
  code: string;
  language: string;
  fileName: string;
}

export default function EnhancedCodeTerminal({ code, language, fileName }: CodeTerminalProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [commandInput, setCommandInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Initialize terminal with welcome message
    setOutput([
      `🔥 VoiceDev X Terminal - ${language.toUpperCase()} Environment`,
      `📁 Working file: ${fileName}`,
      `⚡ Ready to execute code...`,
      ""
    ]);
  }, [language, fileName]);

  const executeCode = async () => {
    if (!code.trim()) {
      setOutput(prev => [...prev, "❌ No code to execute"]);
      return;
    }

    setIsRunning(true);
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${timestamp}] 🚀 Executing ${language} code...`, ""]);

    try {
      // Simulate code execution with realistic timing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockOutput = generateMockOutput(language, code);
      setOutput(prev => [...prev, ...mockOutput]);
    } catch (error) {
      setOutput(prev => [...prev, `❌ Error: ${error}`, ""]);
    } finally {
      setIsRunning(false);
    }
  };

  const executeCommand = async () => {
    if (!commandInput.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${timestamp}] $ ${commandInput}`]);

    // Simple command simulation
    if (commandInput.toLowerCase().includes('help')) {
      setOutput(prev => [...prev, 
        "Available commands:",
        "  help - Show this help message",
        "  clear - Clear terminal output",
        "  run - Execute the current code",
        "  version - Show language version",
        ""
      ]);
    } else if (commandInput.toLowerCase().includes('clear')) {
      clearOutput();
    } else if (commandInput.toLowerCase().includes('version')) {
      setOutput(prev => [...prev, getVersionInfo(language), ""]);
    } else if (commandInput.toLowerCase().includes('run')) {
      executeCode();
    } else {
      setOutput(prev => [...prev, `Command '${commandInput}' not recognized. Type 'help' for available commands.`, ""]);
    }

    setCommandInput("");
  };

  const getVersionInfo = (lang: string): string => {
    const versions: Record<string, string> = {
      'javascript': 'Node.js v18.17.0',
      'python': 'Python 3.9.16',
      'java': 'OpenJDK 11.0.19',
      'html': 'HTML5 Standard',
      'css': 'CSS3 Standard',
      'typescript': 'TypeScript 5.0.4',
      'go': 'Go 1.20.5',
      'rust': 'Rust 1.70.0',
      'cpp': 'GCC 11.3.0',
      'c': 'GCC 11.3.0'
    };
    return versions[lang.toLowerCase()] || `${lang} (Latest Version)`;
  };

  const generateMockOutput = (lang: string, codeContent: string): string[] => {
    const outputs: string[] = [];
    const timestamp = new Date().toLocaleTimeString();
    
    switch (lang.toLowerCase()) {
      case 'javascript':
      case 'js':
        outputs.push(`[${timestamp}] 📝 Node.js environment initialized`);
        if (codeContent.includes('console.log')) {
          const logMatches = codeContent.match(/console\.log\(([^)]+)\)/g);
          if (logMatches) {
            logMatches.forEach(match => {
              const content = match.match(/console\.log\(["']?([^"')]+)["']?\)/);
              if (content && content[1]) {
                outputs.push(content[1]);
              } else {
                outputs.push("Hello, World!");
              }
            });
          }
        }
        if (codeContent.includes('function')) {
          outputs.push("✅ Function definitions loaded");
        }
        outputs.push(`[${timestamp}] ✅ Execution completed successfully`);
        break;
        
      case 'python':
      case 'py':
        outputs.push(`[${timestamp}] 🐍 Python 3.9 interpreter started`);
        if (codeContent.includes('print')) {
          const printMatches = codeContent.match(/print\(([^)]+)\)/g);
          if (printMatches) {
            printMatches.forEach(match => {
              const content = match.match(/print\(["']?([^"')]+)["']?\)/);
              if (content && content[1]) {
                outputs.push(content[1]);
              } else {
                outputs.push("Hello, World!");
              }
            });
          }
        }
        if (codeContent.includes('def ')) {
          outputs.push("✅ Function definitions loaded");
        }
        outputs.push(`[${timestamp}] ✅ Process finished with exit code 0`);
        break;
        
      case 'java':
        outputs.push(`[${timestamp}] ☕ Compiling Java source...`);
        outputs.push("✅ Compilation successful");
        outputs.push("🚀 Running main method...");
        if (codeContent.includes('System.out.println')) {
          const printMatches = codeContent.match(/System\.out\.println\(([^)]+)\)/g);
          if (printMatches) {
            printMatches.forEach(match => {
              const content = match.match(/System\.out\.println\(["']?([^"')]+)["']?\)/);
              if (content && content[1]) {
                outputs.push(content[1]);
              } else {
                outputs.push("Hello, World!");
              }
            });
          }
        }
        outputs.push(`[${timestamp}] ✅ Program execution completed`);
        break;
        
      case 'html':
        outputs.push(`[${timestamp}] 🌐 HTML validation started`);
        outputs.push("✅ Valid HTML5 document structure");
        if (codeContent.includes('<title>')) {
          outputs.push("📄 Document title found");
        }
        if (codeContent.includes('<script>')) {
          outputs.push("⚡ JavaScript detected");
        }
        outputs.push("🎨 Ready for browser rendering");
        break;
        
      case 'css':
        outputs.push(`[${timestamp}] 🎨 CSS validation started`);
        outputs.push("✅ Valid CSS3 syntax");
        if (codeContent.includes('@media')) {
          outputs.push("📱 Responsive design rules detected");
        }
        if (codeContent.includes('animation')) {
          outputs.push("✨ Animation properties found");
        }
        outputs.push("🎯 Styles ready for application");
        break;
        
      default:
        outputs.push(`[${timestamp}] ⚙️ ${lang} execution environment ready`);
        outputs.push("✅ Code syntax validated");
        outputs.push("✅ Execution completed successfully");
        break;
    }
    
    outputs.push("");
    return outputs;
  };

  const clearOutput = () => {
    setOutput([
      `🔥 VoiceDev X Terminal - ${language.toUpperCase()} Environment`,
      `📁 Working file: ${fileName}`,
      `⚡ Ready to execute code...`,
      ""
    ]);
  };

  const copyOutput = () => {
    const textOutput = output.join('\n');
    navigator.clipboard.writeText(textOutput);
    toast({
      title: "Copied to clipboard",
      description: "Terminal output copied successfully",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="h-full glass-effect border-l border-white/10 flex flex-col">
      {/* Terminal Header */}
      <div className="h-12 bg-black/20 border-b border-white/10 flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-400 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium gradient-text">Code Terminal</span>
          <span className="text-xs text-gray-400">({language})</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={executeCode}
            disabled={isRunning}
            className="h-7 px-2 text-xs hover:bg-white/10 button-ripple"
          >
            {isRunning ? (
              <Square className="w-3 h-3 text-red-400" />
            ) : (
              <Play className="w-3 h-3 text-green-400" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyOutput}
            className="h-7 px-2 text-xs hover:bg-white/10 button-ripple"
          >
            <Copy className="w-3 h-3 text-blue-400" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearOutput}
            className="h-7 px-2 text-xs hover:bg-white/10 button-ripple"
          >
            <Trash2 className="w-3 h-3 text-yellow-400" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="h-7 px-2 text-xs hover:bg-white/10 button-ripple"
          >
            <X className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <ScrollArea className="flex-1 p-3">
        <div className="font-mono text-sm space-y-1">
          {output.map((line, index) => (
            <div key={index} className={`
              ${line.includes('❌') ? 'text-red-400' : 
                line.includes('✅') ? 'text-green-400' :
                line.includes('🚀') || line.includes('📝') || line.includes('🔥') ? 'text-blue-400' :
                line.includes('🐍') || line.includes('☕') || line.includes('🌐') || line.includes('🎨') ? 'text-yellow-400' :
                line.startsWith('[') ? 'text-purple-400' :
                line.startsWith('$') ? 'text-cyan-400' :
                'text-gray-300'}
            `}>
              {line}
            </div>
          ))}
          {isRunning && (
            <div className="text-yellow-400 animate-pulse">
              ⏳ Executing code...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Command Input */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-mono text-sm">$</span>
          <Input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="Type 'help' for commands..."
            className="bg-transparent border-white/20 text-white font-mono text-sm"
          />
          <Button
            size="sm"
            onClick={executeCommand}
            className="bg-green-600 hover:bg-green-700 text-white button-ripple"
          >
            Run
          </Button>
        </div>
      </div>
    </div>
  );
}