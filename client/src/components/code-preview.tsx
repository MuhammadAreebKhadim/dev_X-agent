import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle } from "lucide-react";

interface CodePreviewProps {
  code: string;
  language: string;
  fileName: string;
  confidence: number;
  onApprove: () => void;
  onReject: () => void;
}

export default function CodePreview({
  code,
  language,
  fileName,
  confidence,
  onApprove,
  onReject,
}: CodePreviewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs vscode-text-muted">Code Preview</span>
        <div className="flex space-x-1">
          <Badge variant="outline" className="text-xs bg-orange-600 border-orange-600">
            {language}
          </Badge>
          <Badge variant="outline" className="text-xs bg-purple-600 border-purple-600">
            {fileName}
          </Badge>
        </div>
      </div>
      
      <div className="vscode-bg p-3 rounded border vscode-border text-xs font-mono overflow-auto max-h-40">
        <pre className="whitespace-pre-wrap vscode-text">{code}</pre>
      </div>
      
      {/* Confirmation Panel */}
      <div className="mt-3 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-semibold">Confirmation Required</span>
        </div>
        <p className="text-xs vscode-text-muted mb-3">
          The AI wants to insert this code at line 1 in {fileName}. Do you approve?
        </p>
        <div className="flex space-x-2">
          <Button 
            onClick={onApprove}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded"
          >
            <Check className="w-3 h-3 mr-1" />
            Approve
          </Button>
          <Button 
            onClick={onReject}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded"
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
