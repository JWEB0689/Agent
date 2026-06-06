import React, { useState } from 'react';
import { Session, LLMProvider } from '../types';
import { 
  Plus, MessageSquare, Terminal, Settings, Shield, Folder, Sparkles, Layers, Trash2, 
  Edit2, Check, X, LogOut, ChevronRight, HelpCircle 
} from 'lucide-react';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onAddSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  providers: LLMProvider[];
  activePanel: 'chats' | 'files' | 'prompts' | 'plugins' | 'sync';
  onSelectPanel: (panel: 'chats' | 'files' | 'prompts' | 'plugins' | 'sync') => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onAddSession,
  onRenameSession,
  onDeleteSession,
  providers,
  activePanel,
  onSelectPanel
}: SidebarProps) {
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const handleStartRename = (sessionId: string, currentTitle: string) => {
    setEditingIndex(sessionId);
    setRenameTitle(currentTitle);
  };

  const handleSaveRename = (sessionId: string) => {
    if (renameTitle.trim()) {
      onRenameSession(sessionId, renameTitle);
    }
    setEditingIndex(null);
  };

  const getModelLabel = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return 'llama3';
    return session.modelId;
  };

  // Switch icons depending on panel
  const menuItems: Array<{ id: 'chats' | 'files' | 'prompts' | 'plugins' | 'sync'; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'chats', label: 'Dialogue Streams', icon: MessageSquare, badge: sessions.length },
    { id: 'files', label: 'File Mounts', icon: Folder },
    { id: 'prompts', label: 'Prompt Studio', icon: Sparkles },
    { id: 'plugins', label: 'Plugin Registry', icon: Layers },
    { id: 'sync', label: 'Sync Cluster', icon: Shield }
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full select-none shrink-0 font-sans">
      
      {/* 1. Panel Selector Menu switches */}
      <div className="p-3 border-b border-zinc-900 flex flex-col gap-1 shrink-0">
        <span className="text-[8.5px] font-bold text-zinc-650 tracking-widest font-mono uppercase pl-1">NAVIGATION INDEX</span>
        <div className="space-y-0.5 mt-1">
          {menuItems.map(item => {
            const IconComponent = item.icon;
            const isAct = activePanel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPanel(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-left transition-all ${
                  isAct 
                    ? 'bg-zinc-900 border border-zinc-805 text-cyan-400' 
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <IconComponent size={13} className={isAct ? "text-cyan-400" : "text-zinc-500"} />
                  <span className="scale-95 origin-left truncate leading-none">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] leading-none ${isAct ? 'bg-cyan-950 text-cyan-400' : 'bg-zinc-900 text-zinc-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Content below depending on active Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* If Chats is selected, we render the interactive conversation streams sessions */}
        {activePanel === 'chats' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 border-b border-zinc-900 flex items-center justify-between shrink-0">
              <span className="text-[8.5px] font-bold text-zinc-650 tracking-widest font-mono uppercase pl-1">ACTIVE CONVERSATIONS</span>
              <button 
                onClick={onAddSession}
                className="flex items-center gap-1 text-[9.5px] font-bold uppercase text-cyan-400 hover:text-cyan-300 font-mono scale-95 transition-transform active:scale-95"
                title="Establish new conversation branch"
              >
                <Plus size={10} /> branch
              </button>
            </div>

            {/* Conversation streams list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {sessions.map(sess => {
                const isSelected = sess.id === activeSessionId;
                const isEditing = editingIndex === sess.id;

                return (
                  <div 
                    key={sess.id}
                    onClick={() => !isEditing && onSelectSession(sess.id)}
                    className={`group w-full p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col relative ${
                      isSelected 
                        ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 shadow-sm shadow-zinc-950/40' 
                        : 'border-transparent text-zinc-450 hover:bg-zinc-900/20 hover:text-zinc-300'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(sess.id)}
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-xs text-zinc-100 font-sans focus:outline-none focus:border-zinc-700"
                          autoFocus
                        />
                        <button 
                          onClick={() => handleSaveRename(sess.id)}
                          className="p-0.5 bg-emerald-950 text-emerald-450 rounded hover:text-emerald-300 border border-emerald-900"
                        >
                          <Check size={11} />
                        </button>
                        <button 
                          onClick={() => setEditingIndex(null)}
                          className="p-0.5 bg-zinc-800 text-zinc-400 rounded hover:text-zinc-200 border border-zinc-700"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-sans text-[11.5px] font-semibold truncate leading-tight pr-4">
                            {sess.title}
                          </span>
                          
                          {/* Options only shown on hover */}
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5 top-2.5 z-10 shrink-0 space-x-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRename(sess.id, sess.title);
                              }}
                              className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-cyan-400 rounded transition-colors"
                              title="Rename Conversation title"
                            >
                              <Edit2 size={9} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(sess.id);
                              }}
                              className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                              title="Delete dialogue history"
                            >
                              <Trash2 size={9} />
                            </button>
                          </div>
                        </div>

                        {/* Subheader: Model tag */}
                        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-zinc-900/30">
                          <span className="text-[8.5px] font-mono text-zinc-500 flex items-center gap-1 font-semibold truncate uppercase">
                            <Terminal size={9} className="text-zinc-500" />
                            {getModelLabel(sess.id)}
                          </span>
                          <span className="text-[8.5px] font-mono text-zinc-650 uppercase">
                            {sess.messages.length} messages
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 flex flex-col justify-center items-center text-center text-zinc-600 font-sans select-none space-y-3">
            <Settings size={20} className="text-zinc-800 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Auxiliary Panel</h4>
              <p className="text-[9.5px] text-zinc-600 leading-normal">
                Use the navigation index above to configure prompts, sync folders, or activate server tools.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer profile and metadata */}
      <div className="p-3 border-t border-zinc-900 shrink-0 bg-zinc-950/40 text-[10px] font-mono flex flex-col gap-3">
        {/* Resource Monitor */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">CPU</span>
            <span className="text-[8px] text-cyan-400">12%</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-[12%]" />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">RAM</span>
            <span className="text-[8px] text-emerald-400">4.2 / 16 GB</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[26%]" />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">VRAM</span>
            <span className="text-[8px] text-purple-400">1.1 / 8 GB</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-[14%]" />
          </div>
        </div>

        <div className="flex items-center space-x-2 truncate border-t border-zinc-900 pt-3">
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white scale-90 select-none shrink-0">
            OP
          </div>
          <div className="flex flex-col truncate">
            <span className="text-zinc-400 truncate leading-none">System Operator</span>
            <span className="text-[8.5px] text-zinc-600 leading-none mt-1">Local</span>
          </div>
        </div>
      </div>
    </div>
  );
}
