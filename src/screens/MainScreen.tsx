import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSessions } from '../hooks/useSessions';
import Sidebar from '../components/Sidebar';
import PluginMCP from '../components/PluginMCP';
import RTKOptimizer from '../components/RTKOptimizer';
import { DEFAULT_PROVIDERS, DEFAULT_PROMPTS, DEFAULT_MCPS, DEFAULT_SKILLS, INITIAL_FILES } from '../data';
import { Terminal, Settings, LogOut, Plus, Send, Cpu, Activity, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { RTKConfiguration, MCPConfig, SkillPlugin, Message, Session } from '../types';

export default function MainScreen() {
  const { user, logout } = useAuth();
  const { sessions, loading, createSession, updateSessionMessages, updateSessionConfig } = useSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  const [activePanel, setActivePanel] = useState<'chats' | 'files' | 'prompts' | 'plugins' | 'sync' | 'rtk'>('chats');
  const [mcps, setMcps] = useState<MCPConfig[]>(DEFAULT_MCPS);
  const [skills, setSkills] = useState<SkillPlugin[]>(DEFAULT_SKILLS);

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeSessionId || !activeSession) return;
    
    // Check if RTK Bypass enabled
    const rtkBypassStr = activeSession.rtkConfig?.dynamicBypass ? '[BYPASS AUTH:' + activeSession.rtkConfig.modelRoute + ']' : '';
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now().toString()
    };
    
    const updatedMessages = [...(activeSession.messages || []), newMessage];
    setInputText('');
    await updateSessionMessages(activeSessionId, updatedMessages);
    
    setTimeout(async () => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚡ ${rtkBypassStr} Autonomous processing complete. Note: Context optimized efficiently in accordance with RTK guidelines.\n\nRecieved: "${newMessage.content}"`,
        timestamp: (Date.now() + 1).toString()
      };
      await updateSessionMessages(activeSessionId, [...updatedMessages, assistantMessage]);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

           <div className="flex-1 flex flex-col p-6 space-y-6 w-full max-w-4xl mx-auto">
              {(!activeSession?.messages || activeSession.messages.length === 0) ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 my-20 select-none">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl mb-5 shadow-2xl">
                    <Terminal size={48} strokeWidth={1} />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-100 tracking-tight">System Matrix Online</h3>
                  <p className="text-sm text-zinc-500 mt-2 max-w-sm">Establish a communication line. Models execute in secure isolation.</p>
                </div>
              ) : (
                activeSession.messages.map((msg) => (
                  <div key={msg.id} className={clsx("flex flex-col gap-1.5 max-w-[85%]", msg.role === 'user' ? "self-end items-end" : "self-start items-start")}>
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-zinc-500 px-1">
                      {msg.role === 'user' ? 'Operator' : 'AI Core'}
                    </div>
                    <div className={clsx(
                      "px-4 py-3 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm",
                      msg.role === 'user' 
                        ? "bg-zinc-800 text-zinc-100 rounded-br-sm border border-zinc-700/50" 
                        : "bg-cyan-950/20 text-cyan-50 border border-cyan-900/30 rounded-bl-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={endOfMessagesRef} className="h-4" />
           </div>
         </div>

         {/* Chat Input */}
         <div className="p-4 bg-zinc-950 shrink-0 border-t border-zinc-900">
           <div className="max-w-4xl mx-auto relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all shadow-lg p-2">
             <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Initiate command sequence... (Shift+Enter for break)"
               className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 text-sm resize-none h-[64px] px-3 py-2 font-mono focus:outline-none scrollbar-hide"
             />
             <div className="flex justify-between items-center px-2 pt-2 border-t border-zinc-800/50">
               <div className="flex items-center gap-3">
                 <button className="text-zinc-500 hover:text-cyan-400 p-1.5 rounded transition-colors" title="Attach Document Mount">
                   <Plus size={16} />
                 </button>
                 <button onClick={() => setActivePanel('plugins')} className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-cyan-400 font-mono transition-colors">
                   Plugins {skills.filter(s=>s.isEnabled).length} active
                 </button>
               </div>
               <button 
                 onClick={handleSendMessage}
                 disabled={!inputText.trim()}
                 className="bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30 disabled:hover:bg-cyan-600 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center font-mono text-xs tracking-wider uppercase shadow-md disabled:shadow-none"
               >
                 Dispatch <Send size={14} className="ml-1.5" />
               </button>
             </div>
           </div>
         </div>
      </main>
    </div>
  );
}
