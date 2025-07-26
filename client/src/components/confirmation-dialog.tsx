import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  fileName: string;
  onApprove: () => void;
  onReject: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  code,
  language,
  fileName,
  onApprove,
  onReject,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 vscode-secondary border vscode-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-sm">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span>Code Review Required</span>
          </DialogTitle>
          <DialogDescription className="text-xs vscode-text-muted">
            VoiceDev X wants to make the following changes:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="vscode-bg p-3 rounded border vscode-border text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400">+ Create/Modify file:</span>
              <div className="flex space-x-1">
                <Badge variant="outline" className="text-xs bg-orange-600 border-orange-600">
                  {language}
                </Badge>
                <Badge variant="outline" className="text-xs bg-purple-600 border-purple-600">
                  {fileName}
                </Badge>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-xs vscode-text font-mono max-h-32 overflow-y-auto">
              {code}
            </pre>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            onClick={onReject}
            variant="outline"
            size="sm"
            className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={onApprove}
            size="sm"
            className="px-4 py-2 text-xs bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-3 h-3 mr-1" />
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
