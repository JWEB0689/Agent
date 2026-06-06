import React, { useState, useRef } from 'react';
import { VirtualFile } from '../types';
import { Folder, FolderPlus, FileText, FileCode, Plus, Trash2, Edit2, UploadCloud, X, ArrowLeft, Save, File, Layers } from 'lucide-react';

interface ExplorerFSProps {
  files: VirtualFile[];
  onAddFile: (file: VirtualFile) => void;
  onUpdateFile: (fileId: string, updatedContent: string) => void;
  onDeleteFile: (fileId: string) => void;
  attachedFileNames: string[];
  onToggleAttachment: (fileName: string) => void;
}

export default function ExplorerFS({
  files,
  onAddFile,
  onUpdateFile,
  onDeleteFile,
  attachedFileNames,
  onToggleAttachment
}: ExplorerFSProps) {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<VirtualFile | null>(null);
  const [editedCode, setEditedCode] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse root folders vs files
  const rootFiles = files.filter(f => !f.path.substring(1).includes('/'));
  const nestedFiles = files.filter(f => f.path.substring(1).includes('/'));

  // Get folders
  const folders = files.filter(f => f.isDir);

  const getFilesInFolder = (folderPath: string) => {
    return files.filter(f => !f.isDir && f.path.startsWith(folderPath + '/') && !f.path.replace(folderPath + '/', '').includes('/'));
  };

  const handleEditClick = (file: VirtualFile) => {
    setEditingFile(file);
    setEditedCode(file.content);
  };

  const handleSaveEdit = () => {
    if (editingFile) {
      onUpdateFile(editingFile.id, editedCode);
      setEditingFile(null);
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const cleanPath = newFileName.startsWith('/') ? newFileName : `/${newFileName}`;
    
    // Check if file already exists
    const exists = files.some(f => f.path === cleanPath);
    if (exists) {
      alert('A file at this path already exists.');
      return;
    }

    const newF: VirtualFile = {
      id: 'usr_' + Date.now(),
      name: newFileName.split('/').pop() || newFileName,
      path: cleanPath,
      content: `# New dynamic file: ${newFileName}\n\nCreated in local workbench at ${new Date().toLocaleTimeString()}`,
      size: 150,
      type: getFileTypeByName(newFileName),
      isDir: false
    };

    onAddFile(newF);
    setNewFileName('');
    setIsCreating(false);
  };

  const getFileTypeByName = (name: string) => {
    if (name.endsWith('.json')) return 'application/json';
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.tsx')) return 'text/typescript';
    if (name.endsWith('.py')) return 'text/x-python';
    if (name.endsWith('.md')) return 'text/markdown';
    return 'text/plain';
  };

  // Upload/Drag Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processUploadedFile = (fileObj: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      const newF: VirtualFile = {
        id: 'upload_' + Date.now(),
        name: fileObj.name,
        path: `/${fileObj.name}`,
        content: content,
        size: fileObj.size,
        type: fileObj.type || 'text/plain',
        isDir: false
      };
      onAddFile(newF);
    };
    reader.readAsText(fileObj);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files as Iterable<File>).forEach((fileObj: File) => {
        processUploadedFile(fileObj);
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files as Iterable<File>).forEach((fileObj: File) => {
        processUploadedFile(fileObj);
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 font-sans">
      {/* If we are editing, overlay the editor */}
      {editingFile ? (
        <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
          <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950">
            <button 
              onClick={() => setEditingFile(null)}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-900 px-2 py-1 rounded"
            >
              <ArrowLeft size={12} />
              Back
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">{editingFile.name}</span>
              <span className="text-[9px] text-zinc-500">{editingFile.path}</span>
            </div>
            <button 
              onClick={handleSaveEdit}
              className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded font-medium"
            >
              <Save size={12} />
              Save File
            </button>
          </div>
          <div className="flex-1 p-3 font-mono text-xs flex flex-col bg-zinc-950">
            <div className="text-[10px] text-zinc-500 mb-1 flex items-center justify-between">
              <span>LOCAL FILE BUFFER SOURCE</span>
              <span>LINES: {editedCode.split('\n').length}</span>
            </div>
            <textarea
              className="flex-1 bg-zinc-900/40 border border-zinc-800 rounded p-3 text-cyan-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-100 font-mono">Workspace Files</h2>
              <p className="text-[10px] text-zinc-500 leading-normal">Virtual and real mapped filesystem mount</p>
            </div>
            <button 
              onClick={() => setIsCreating(prev => !prev)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-cyan-400 rounded transition-colors"
              title="Allocate Raw File"
            >
              <FolderPlus size={13} />
            </button>
          </div>

          {/* Create File Mini-form */}
          {isCreating && (
            <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex flex-col gap-2 animate-in slide-in-from-top-1 duration-200">
              <span className="text-[10px] font-semibold text-zinc-400 font-mono uppercase">Provide filepath:</span>
              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="/src/agent.js"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
                />
                <button
                  onClick={handleCreateFile}
                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded text-[11px] font-semibold"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Files List tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {/* Folder Structures */}
            {folders.map(folder => {
              const insideFiles = getFilesInFolder(folder.path);
              const isOpen = activeFolderId === folder.id;
              return (
                <div key={folder.id} className="space-y-1">
                  <div 
                    onClick={() => setActiveFolderId(isOpen ? null : folder.id)}
                    className="flex items-center justify-between p-1.5 hover:bg-zinc-900/50 rounded cursor-pointer transition-colors user-select-none"
                  >
                    <div className="flex items-center space-x-2 text-xs">
                      <Folder size={14} className={isOpen ? "text-cyan-400 shrink-0" : "text-zinc-500 shrink-0"} />
                      <span className="font-mono text-zinc-300 font-medium">{folder.name}</span>
                    </div>
                    <span className="text-[9px] text-zinc-600 font-mono">{insideFiles.length} file(s)</span>
                  </div>
                  
                  {isOpen && (
                    <div className="pl-4 border-l border-zinc-800/80 space-y-1 mt-0.5">
                      {insideFiles.map(file => (
                        <FileRow 
                          key={file.id} 
                          file={file} 
                          onEdit={handleEditClick} 
                          onDelete={onDeleteFile}
                          isAttached={attachedFileNames.includes(file.name)}
                          onToggleAttach={onToggleAttachment}
                        />
                      ))}
                      {insideFiles.length === 0 && (
                        <p className="text-[10px] text-zinc-600 pl-2 font-mono italic">Empty directory</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Root Level Files */}
            <div className="space-y-1.5 border-t border-zinc-900 pt-3">
              <span className="text-[9px] text-zinc-600 font-semibold tracking-wider font-mono">ROOT DIR FILES</span>
              {rootFiles.filter(f => !f.isDir).map(file => (
                <FileRow 
                  key={file.id} 
                  file={file} 
                  onEdit={handleEditClick} 
                  onDelete={onDeleteFile}
                  isAttached={attachedFileNames.includes(file.name)}
                  onToggleAttach={onToggleAttachment}
                />
              ))}
            </div>
          </div>

          {/* Dynamic Drag and Drop Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 border-t border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer ${
              isDragging 
                ? 'bg-cyan-950/20 border-cyan-700 text-cyan-300' 
                : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900/60 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              multiple 
            />
            <UploadCloud size={20} className="mb-1.5 transition-transform group-hover:scale-105" />
            <p className="text-[10px] font-mono text-center leading-normal">
              Drag & Drop files here, or <strong className="text-zinc-400">click to import</strong> to local filesystem
            </p>
            <p className="text-[8px] text-zinc-600 font-mono mt-1 text-center leading-none">
              Supports markdown, JSON, python, CSV, logs
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Inner FileRow Component
interface FileRowProps {
  file: VirtualFile;
  onEdit: (file: VirtualFile) => void;
  onDelete: (fileId: string) => void;
  isAttached: boolean;
  onToggleAttach: (fileName: string) => void;
}

const FileRow: React.FC<FileRowProps> = ({ file, onEdit, onDelete, isAttached, onToggleAttach }) => {
  const isCode = file.name.endsWith('.py') || file.name.endsWith('.js') || file.name.endsWith('.tsx') || file.name.endsWith('.json');

  return (
    <div className="group flex items-center justify-between p-1.5 hover:bg-zinc-900/60 rounded border border-transparent hover:border-zinc-800/50 transition-all">
      <div className="flex items-center space-x-2 text-xs truncate flex-1 min-w-0">
        <button 
          onClick={() => onToggleAttach(file.name)}
          title={isAttached ? 'Click to detach' : 'Click to attach file to message thread'}
          className={`shrink-0 w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center border transition-colors ${
            isAttached 
              ? 'bg-cyan-950 text-cyan-400 border-cyan-800' 
              : 'bg-zinc-950 text-zinc-600 border-zinc-800 group-hover:text-zinc-500 hover:border-zinc-700'
          }`}
        >
          {isAttached ? '@' : ''}
        </button>
        
        {isCode ? (
          <FileCode size={13} className="text-cyan-500 shrink-0" />
        ) : (
          <FileText size={13} className="text-zinc-400 shrink-0" />
        )}
        <span className="font-mono text-[11px] text-zinc-300 truncate font-normal leading-none" title={file.path}>
          {file.name}
        </span>
      </div>

      <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[8px] font-mono text-zinc-600 mr-1 shrink-0">
          {(file.size / 1024).toFixed(1)}k
        </span>
        <button 
          onClick={() => onEdit(file)}
          className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 rounded transition-colors"
          title="Edit file inline"
        >
          <Edit2 size={9} />
        </button>
        <button 
          onClick={() => onDelete(file.id)}
          className="p-1 bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 rounded transition-colors"
          title="Delete file"
        >
          <Trash2 size={9} />
        </button>
      </div>
    </div>
  );
}
