import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSessions } from '../hooks/useSessions';
import Sidebar from '../components/Sidebar';
import PluginMCP from '../components/PluginMCP';
import RTKOptimizer from '../components/RTKOptimizer';
import ChatArea from '../components/ChatArea';
import ExplorerFS from '../components/ExplorerFS';
import { DEFAULT_PROVIDERS, DEFAULT_PROMPTS, DEFAULT_MCPS, DEFAULT_SKILLS, INITIAL_FILES } from '../data';
import { Activity, LogOut, Cpu, Settings, Terminal, Plus, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { RTKConfiguration, MCPConfig, SkillPlugin, Message, Session, VirtualFile, PromptPreset } from '../types';

export default function MainScreen() {
  const { user, logout } = useAuth();
  const { sessions, loading, createSession, updateSessionMessages, updateSessionConfig } = useSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  const [activePanel, setActivePanel] = useState<'chats' | 'files' | 'prompts' | 'plugins' | 'sync' | 'rtk'>('chats');
  const [mcps, setMcps] = useState<MCPConfig[]>(DEFAULT_MCPS);
  const [skills, setSkills] = useState<SkillPlugin[]>(DEFAULT_SKILLS);
  const [files, setFiles] = useState<VirtualFile[]>(INITIAL_FILES);
  const [attachedFileNames, setAttachedFileNames] = useState<string[]>([]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      if (sessions.length === 0) {
        createSession().then((id) => {
          if (id) setActiveSessionId(id);
        });
      } else if (sessions.length > 0 && !activeSessionId) {
        setActiveSessionId(sessions[0].id);
      } else if (sessions.length > 0 && activeSessionId && !sessions.find(s => s.id === activeSessionId)) {
        setActiveSessionId(sessions[0].id);
      }
    }
  }, [loading, sessions.length, activeSessionId, createSession]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSendMessage = async (content: string, attached: string[] = []) => {
    if (!content.trim() && attached.length === 0 || !activeSessionId || !activeSession) return;
    
    // Check if RTK Bypass enabled
    const rtkBypassStr = activeSession.rtkConfig?.dynamicBypass ? '[BYPASS AUTH:' + activeSession.rtkConfig.modelRoute + ']' : '';
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now().toString(),
      attachedFiles: attached
    };
    
    const updatedMessages = [...(activeSession.messages || []), newMessage];
    await updateSessionMessages(activeSessionId, updatedMessages);
    
    setTimeout(async () => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚡ ${rtkBypassStr} Autonomous processing complete. Note: Context optimized efficiently in accordance with RTK guidelines.\n\nReceived: "${newMessage.content}"`,
        timestamp: (Date.now() + 1).toString()
      };
      await updateSessionMessages(activeSessionId, [...updatedMessages, assistantMessage]);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-300 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Sidebar with Advanced Theming */}
      <Sidebar 
        sessions={sessions as any}
        activeSessionId={activeSessionId || ''}
        onSelectSession={setActiveSessionId}
        onAddSession={() => createSession().then((id) => id && setActiveSessionId(id))}
        onRenameSession={() => {}} 
        onDeleteSession={() => {}}
        providers={DEFAULT_PROVIDERS}
        activePanel={activePanel as any}
        onSelectPanel={(p) => setActivePanel(p as any)}
      />

         {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative border-l border-zinc-900/50">
         <header className="h-14 border-b border-zinc-900/80 flex items-center justify-between px-6 shrink-0 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-10 shadow-sm shadow-zinc-950/20">
           <div className="flex flex-col">
             <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
               {activeSession?.title || 'No Active Session'}
               {activeSession?.rtkConfig?.dynamicBypass && (
                 <span className="px-1.5 py-0.5 rounded text-[8px] tracking-widest uppercase font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/50 flex items-center gap-1">
                   <Activity size={8} /> AUTONOMOUS BYPASS
                 </span>
               )}
             </h2>
             <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
               {activeSession?.messages?.length || 0} MSG / RTK {activeSession?.rtkConfig?.enabled ? 'ACTIVE' : 'OFF'}
             </span>
           </div>
           <div className="flex items-center gap-2">
             <button
               onClick={() => setActivePanel(activePanel === 'rtk' ? 'chats' : 'rtk')}
               className={clsx(
                 "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all active:scale-95 border",
                 activePanel === 'rtk' ? "bg-emerald-950 text-emerald-400 border-emerald-900/50" : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-transparent"
               )}
             >
               <Cpu size={14} /> RTK Optimization
             </button>
             <button onClick={logout} className="p-2 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-rose-400 transition-colors">
               <LogOut size={16} />
             </button>
           </div>
         </header>
         
         <div className="flex-1 overflow-y-auto p-0 flex flex-col relative scrollbar-thin">
           
           {activePanel === 'plugins' && (
             <div className="absolute inset-0 bg-zinc-950 z-20">
               <PluginMCP 
                 mcpConfigs={mcps} 
                 skills={skills} 
                 onToggleMCP={(id) => setMcps(mcps.map(m => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m))}
                 onToggleSkill={(id) => setSkills(skills.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))}
                 onAddMCP={(mcp) => setMcps([...mcps, mcp])}
               />
             </div>
           )}

           {activePanel === 'rtk' && activeSession && (
             <div className="absolute inset-0 bg-zinc-950 z-20 p-8 flex items-start justify-center backdrop-blur-sm bg-zinc-950/95 overflow-y-auto">
               <RTKOptimizer 
                 config={activeSession.rtkConfig} 
                 onUpdate={(config) => updateSessionConfig(activeSession.id, { rtkConfig: config })}
               />
             </div>
           )}

           {activePanel === 'files' && (
             <div className="absolute inset-0 bg-zinc-950 z-20">
               <ExplorerFS
                 files={files}
                 onAddFile={(f) => setFiles([...files, f])}
                 onUpdateFile={(id, content) => setFiles(files.map(fi => fi.id === id ? { ...fi, content } : fi))}
                 onDeleteFile={(id) => setFiles(files.filter(fi => fi.id !== id))}
                 onToggleAttachment={(name) => {
                   setAttachedFileNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
                 }}
                 attachedFileNames={attachedFileNames}
               />
             </div>
           )}

           {activePanel === 'chats' && activeSession && (
             <ChatArea
               session={activeSession}
               providers={DEFAULT_PROVIDERS}
               mcpConfigs={mcps}
               skills={skills}
               virtualFiles={files}
               promptPresets={DEFAULT_PROMPTS}
               onSendMessage={handleSendMessage}
               onClearSessionMessages={() => updateSessionMessages(activeSession.id, [])}
               onChangeSessionParam={(param, value) => updateSessionConfig(activeSession.id, { [param]: value })}
               attachedFileNames={attachedFileNames}
               onToggleAttachment={(name) => {
                 setAttachedFileNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
               }}
             />
           )}
         </div>
      </main>
    </div>
  );
}
