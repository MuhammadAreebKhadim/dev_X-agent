import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Folder, FileText, FolderPlus, FilePlus, Edit3, 
  Save, X, ChevronRight, ChevronDown, Code2,
  Settings, MoreHorizontal, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: string;
  children?: FileStructure[];
}

interface EnhancedFileExplorerProps {
  fileExplorer: FileStructure[];
  setFileExplorer: React.Dispatch<React.SetStateAction<FileStructure[]>>;
  currentFile: FileStructure | null;
  setCurrentFile: (file: FileStructure | null) => void;
  codeEditor: string;
  setCodeEditor: (content: string) => void;
  expandedFolders: string[];
  setExpandedFolders: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function EnhancedFileExplorer({
  fileExplorer,
  setFileExplorer,
  currentFile,
  setCurrentFile,
  codeEditor,
  setCodeEditor,
  expandedFolders,
  setExpandedFolders
}: EnhancedFileExplorerProps) {
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [showFileCreator, setShowFileCreator] = useState(false);
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file');

  const getFileIcon = (fileName: string, type: string) => {
    if (type === 'folder') return <Folder className="w-4 h-4 text-blue-400" />;
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
      'py': { icon: <FileText className="w-4 h-4" />, color: 'text-yellow-400' },
      'js': { icon: <FileText className="w-4 h-4" />, color: 'text-yellow-300' },
      'ts': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-400' },
      'jsx': { icon: <FileText className="w-4 h-4" />, color: 'text-cyan-400' },
      'tsx': { icon: <FileText className="w-4 h-4" />, color: 'text-cyan-300' },
      'html': { icon: <FileText className="w-4 h-4" />, color: 'text-orange-400' },
      'css': { icon: <FileText className="w-4 h-4" />, color: 'text-purple-400' },
      'json': { icon: <FileText className="w-4 h-4" />, color: 'text-green-400' },
      'java': { icon: <FileText className="w-4 h-4" />, color: 'text-red-400' },
      'go': { icon: <FileText className="w-4 h-4" />, color: 'text-cyan-600' },
      'rust': { icon: <FileText className="w-4 h-4" />, color: 'text-orange-600' },
      'cpp': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-600' },
      'c': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-500' },
    };
    
    const fileType = iconMap[ext || ''] || { icon: <FileText className="w-4 h-4" />, color: 'text-gray-400' };
    return <span className={fileType.color}>{fileType.icon}</span>;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleFileClick = (file: FileStructure) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      setCurrentFile(file);
      setCodeEditor(file.content || '');
    }
  };

  const handleRename = (fileId: string, newName: string) => {
    setFileExplorer(prev => prev.map(file => 
      file.id === fileId ? { ...file, name: newName } : file
    ));
    setEditingFile(null);
  };

  const handleDelete = (fileId: string) => {
    setFileExplorer(prev => prev.filter(file => file.id !== fileId));
    if (currentFile && currentFile.id === fileId) {
      setCurrentFile(null);
      setCodeEditor('');
    }
  };

  const createNewFile = () => {
    if (!newFileName.trim()) return;
    
    const newFile: FileStructure = {
      id: Date.now().toString(),
      name: newFileName,
      type: newFileType,
      path: newFileName,
      content: newFileType === 'file' ? '' : undefined,
      language: newFileType === 'file' ? getLanguageFromExtension(newFileName) : undefined,
      children: newFileType === 'folder' ? [] : undefined
    };
    
    setFileExplorer(prev => [...prev, newFile]);
    setNewFileName('');
    setShowFileCreator(false);
    
    if (newFileType === 'file') {
      setCurrentFile(newFile);
      setCodeEditor('');
    }
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'c': 'c'
    };
    return langMap[ext || ''] || 'text';
  };

  const renderFileItem = (file: FileStructure, depth = 0) => (
    <div key={file.id} className="slide-in-up">
      <div 
        className={`
          flex items-center justify-between p-2 rounded-lg transition-all duration-200
          hover:bg-white/5 hover:backdrop-blur-sm cursor-pointer group
          ${currentFile?.id === file.id ? 'bg-blue-500/20 neon-glow' : ''}
          ${depth > 0 ? `ml-${depth * 4}` : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <div 
          className="flex items-center space-x-2 flex-1"
          onClick={() => handleFileClick(file)}
        >
          {file.type === 'folder' && (
            <span className="text-gray-400">
              {expandedFolders.includes(file.id) ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
              }
            </span>
          )}
          {getFileIcon(file.name, file.type)}
          
          {editingFile === file.id ? (
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(file.id, newFileName);
                if (e.key === 'Escape') setEditingFile(null);
              }}
              onBlur={() => handleRename(file.id, newFileName)}
              className="h-6 text-xs bg-transparent border-blue-400"
              autoFocus
            />
          ) : (
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
              {file.name}
            </span>
          )}
          
          {file.language && (
            <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
              {file.language}
            </Badge>
          )}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-blue-500/20"
            onClick={(e) => {
              e.stopPropagation();
              setEditingFile(file.id);
              setNewFileName(file.name);
            }}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-red-500/20"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(file.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {file.type === 'folder' && expandedFolders.includes(file.id) && file.children && (
        <div className="ml-4">
          {file.children.map(child => renderFileItem(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="glass-effect border-white/10 h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold gradient-text">File Explorer</h3>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 button-ripple hover:bg-blue-500/20"
              onClick={() => {
                setShowFileCreator(true);
                setNewFileType('file');
              }}
            >
              <FilePlus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 button-ripple hover:bg-green-500/20"
              onClick={() => {
                setShowFileCreator(true);
                setNewFileType('folder');
              }}
            >
              <FolderPlus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {showFileCreator && (
          <div className="mb-4 p-4 glass-effect rounded-lg border border-blue-400/30 slide-in-up">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="outline" className={newFileType === 'file' ? 'border-blue-400' : 'border-green-400'}>
                {newFileType === 'file' ? 'New File' : 'New Folder'}
              </Badge>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Enter file name:</label>
                <Input
                  placeholder={newFileType === 'file' ? 'example.js, style.css, app.py' : 'folder-name'}
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createNewFile();
                    if (e.key === 'Escape') setShowFileCreator(false);
                  }}
                  className="w-full h-8 text-sm glass-effect border-blue-400/50"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {newFileType === 'file' ? 'Include extension (.js, .py, .css, etc.)' : 'Folder name without spaces recommended'}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={createNewFile}
                    disabled={!newFileName.trim()}
                    className="h-7 px-3 bg-green-600 hover:bg-green-700 button-ripple"
                  >
                    OK
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFileCreator(false)}
                    className="h-7 px-3 button-ripple"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="h-[calc(100%-8rem)]">
          <div className="space-y-1">
            {fileExplorer.map(file => renderFileItem(file))}
            
            {fileExplorer.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No files yet</p>
                <p className="text-xs opacity-75">Use voice commands to create files</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}