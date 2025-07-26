import { useQuery } from "@tanstack/react-query";
import { Folder, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectFile } from "@shared/schema";

export default function FileExplorer() {
  const { data: files = [] } = useQuery<ProjectFile[]>({
    queryKey: ["/api/project-files"],
    refetchInterval: 5000,
  });

  return (
    <div className="p-4 border-b vscode-border">
      <h3 className="text-xs font-semibold mb-2 vscode-text-muted uppercase tracking-wide">Explorer</h3>
      <div className="space-y-1 text-xs">
        <div className="flex items-center space-x-2 hover:vscode-tertiary p-1 rounded cursor-pointer">
          <Folder className="w-3 h-3 vscode-text-muted" />
          <span>my-project</span>
        </div>
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.id} className="ml-4 flex items-center space-x-2 hover:vscode-tertiary p-1 rounded cursor-pointer">
              <FileText className="w-3 h-3 text-yellow-400" />
              <span>{file.fileName}</span>
            </div>
          ))
        ) : (
          <div className="ml-4 flex items-center space-x-2 hover:vscode-tertiary p-1 rounded cursor-pointer">
            <FileText className="w-3 h-3 text-yellow-400" />
            <span>main.py</span>
          </div>
        )}
      </div>
      
      {/* Recent Voice Commands */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold mb-2 vscode-text-muted uppercase tracking-wide">Recent Commands</h3>
        <div className="space-y-2 text-xs">
          <div className="p-2 vscode-tertiary rounded">
            <div className="text-green-400 mb-1">✓ Function created</div>
            <div className="vscode-text-muted">"Create add function"</div>
          </div>
          <div className="p-2 vscode-tertiary rounded">
            <div className="text-blue-400 mb-1">ℹ File created</div>
            <div className="vscode-text-muted">"New Python file"</div>
          </div>
        </div>
      </div>
    </div>
  );
}
