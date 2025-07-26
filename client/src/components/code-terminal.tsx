import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Square, Terminal, Copy, Trash2, Download,
  CheckCircle, AlertCircle, Clock, Zap
} from "lucide-react";

interface TerminalOutput {
  id: string;
  type: 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp: Date;
}

interface CodeTerminalProps {
  code: string;
  language: string;
  fileName: string;
  onRun?: (code: string, language: string) => Promise<any>;
}

export default function CodeTerminal({ code, language, fileName, onRun }: CodeTerminalProps) {
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addOutput = (type: TerminalOutput['type'], content: string) => {
    const newOutput: TerminalOutput = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setOutput(prev => [...prev, newOutput]);
  };

  const executeCode = async () => {
    if (!code.trim()) {
      addOutput('error', 'No code to execute');
      return;
    }

    setIsRunning(true);
    const startTime = Date.now();
    
    addOutput('info', `> Executing ${language} code from ${fileName}...`);
    
    try {
      // Simulate code execution based on language
      const result = await simulateCodeExecution(code, language);
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      if (result.success) {
        addOutput('success', `✓ Execution completed successfully`);
        if (result.output) {
          addOutput('output', result.output);
        }
      } else {
        addOutput('error', `✗ Execution failed: ${result.error}`);
      }
    } catch (error) {
      addOutput('error', `✗ Runtime error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const simulateCodeExecution = async (code: string, lang: string): Promise<{success: boolean, output?: string, error?: string}> => {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock execution results based on language and code content
    if (lang === 'python') {
      if (code.includes('print')) {
        const printMatches = code.match(/print\s*\(([^)]+)\)/g);
        if (printMatches) {
          const outputs = printMatches.map(match => {
            const content = match.match(/print\s*\(([^)]+)\)/)?.[1] || '';
            return content.replace(/['"]/g, '');
          });
          return { success: true, output: outputs.join('\n') };
        }
      }
      if (code.includes('def ')) {
        return { success: true, output: 'Function defined successfully' };
      }
    }
    
    if (lang === 'javascript') {
      if (code.includes('console.log')) {
        const logMatches = code.match(/console\.log\s*\(([^)]+)\)/g);
        if (logMatches) {
          const outputs = logMatches.map(match => {
            const content = match.match(/console\.log\s*\(([^)]+)\)/)?.[1] || '';
            return content.replace(/['"]/g, '');
          });
          return { success: true, output: outputs.join('\n') };
        }
      }
      if (code.includes('function ')) {
        return { success: true, output: 'Function declared successfully' };
      }
    }
    
    if (lang === 'java') {
      if (code.includes('System.out.println')) {
        return { success: true, output: 'Hello World' };
      }
    }
    
    // Default success response
    return { success: true, output: `${lang} code executed successfully` };
  };

  const clearOutput = () => {
    setOutput([]);
    setExecutionTime(null);
  };

  const copyOutput = () => {
    const outputText = output.map(o => `[${o.type.toUpperCase()}] ${o.content}`).join('\n');
    navigator.clipboard.writeText(outputText);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const getOutputIcon = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'info': return <Clock className="w-3 h-3 text-blue-400" />;
      default: return <Terminal className="w-3 h-3 text-gray-400" />;
    }
  };

  const getOutputColor = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <Card className="glass-effect border-white/10 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="gradient-text">Code Terminal</span>
            <Badge variant="outline" className="text-xs">
              {language}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {executionTime && (
              <Badge variant="secondary" className="text-xs">
                {executionTime}ms
              </Badge>
            )}
            <Button
              size="sm"
              onClick={executeCode}
              disabled={isRunning || !code.trim()}
              className={`h-7 px-3 button-ripple ${
                isRunning ? 'bg-orange-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-3 h-3 mr-1" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Run
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyOutput}
              disabled={output.length === 0}
              className="h-7 px-2 button-ripple"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearOutput}
              disabled={output.length === 0}
              className="h-7 px-2 button-ripple"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-64 w-full" ref={scrollRef}>
          <div className="space-y-2 font-mono text-sm">
            {output.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click Run to execute code</p>
                  <p className="text-xs opacity-75">Output will appear here</p>
                </div>
              </div>
            ) : (
              output.map((item) => (
                <div key={item.id} className="flex items-start space-x-2 slide-in-up">
                  {getOutputIcon(item.type)}
                  <div className="flex-1">
                    <div className={`${getOutputColor(item.type)} break-words whitespace-pre-wrap`}>
                      {item.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isRunning && (
              <div className="flex items-center space-x-2 text-orange-400 animate-pulse">
                <Zap className="w-3 h-3" />
                <span>Executing code...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Code Preview */}
        <div className="mt-4 p-3 glass-effect rounded border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Code to execute:</span>
            <span className="text-xs text-gray-500">{fileName}</span>
          </div>
          <ScrollArea className="h-20">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
              {code || 'No code available'}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}