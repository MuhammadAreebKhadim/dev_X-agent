import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, XCircle, Clock, Zap, Code, FileText, 
  AlertTriangle, Info, RefreshCw, Eye
} from "lucide-react";
import CodePreview from "@/components/code-preview";

interface CheckpointDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  pendingCode: {
    code: string;
    language: string;
    fileName: string;
    confidence: number;
    operation?: 'create' | 'modify' | 'replace';
    lineNumber?: number;
  };
  voiceCommand: string;
  suggestions?: string[];
}

export default function CheckpointDialog({
  isOpen,
  onClose,
  onApprove,
  onReject,
  pendingCode,
  voiceCommand,
  suggestions = []
}: CheckpointDialogProps) {
  if (!isOpen) return null;

  const getOperationIcon = () => {
    switch (pendingCode.operation) {
      case 'create': return <FileText className="w-4 h-4 text-green-500" />;
      case 'modify': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'replace': return <Code className="w-4 h-4 text-orange-500" />;
      default: return <Code className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-600 text-white border-green-600';
    if (confidence >= 0.6) return 'bg-yellow-600 text-white border-yellow-600';
    return 'bg-red-600 text-white border-red-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-gray-900 border-gray-700 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  Code Generation Checkpoint
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Review and approve the generated code before applying
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Command Summary */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-2">Voice Command</h3>
                <p className="text-sm text-gray-300 italic">"{voiceCommand}"</p>
                
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    {getOperationIcon()}
                    <span className="text-xs text-gray-400 capitalize">
                      {pendingCode.operation || 'create'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {pendingCode.fileName}
                    </span>
                  </div>
                  
                  {pendingCode.lineNumber && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        Line {pendingCode.lineNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Badge variant="outline" className={`text-xs ${getConfidenceBadge(pendingCode.confidence)}`}>
                {Math.round(pendingCode.confidence * 100)}% Confidence
              </Badge>
            </div>
          </div>

          {/* Code Preview */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Generated Code</h3>
            </div>
            
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <ScrollArea className="max-h-80">
                <div className="p-4 bg-[#1e1e1e] rounded font-mono text-sm text-gray-100">
                  <pre className="whitespace-pre-wrap">{pendingCode.code}</pre>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Quality Indicators */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-center">
              <div className={`text-lg font-bold ${getConfidenceColor(pendingCode.confidence)}`}>
                {Math.round(pendingCode.confidence * 100)}%
              </div>
              <div className="text-xs text-gray-400">AI Confidence</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {pendingCode.code.split('\n').length}
              </div>
              <div className="text-xs text-gray-400">Lines of Code</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {pendingCode.language.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400">Language</div>
            </div>
          </div>

          {/* Safety Warning */}
          {pendingCode.confidence < 0.7 && (
            <div className="p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                    Low Confidence Warning
                  </h4>
                  <p className="text-xs text-yellow-300">
                    The AI has low confidence in this code generation. 
                    Please review carefully before applying.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Alternative Commands</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-gray-700" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Review and approve to apply changes</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onReject}
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              
              <Button
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}