import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSessions, Message } from '../hooks/useSessions';
import { Terminal, Settings, LogOut, Plus, MessageSquare, Send, Trash2, Cpu } from 'lucide-react';
import { clsx } from 'clsx';

export default function MainScreen() {
  const { user, logout } = useAuth();
  const { sessions, loading, createSession, updateSessionMessages, deleteSession } = useSessions();
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  // Create a default session if there are no sessions
  useEffect(() => {
    if (!loading && sessions.length === 0) {
      createSession().then((id) => {
        if (id) setActiveSessionId(id);
      });
    } else if (!loading && sessions.length > 0 && !activeSessionId && !sessions.find(s => s.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [loading, sessions, activeSessionId, createSession]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeSessionId || !activeSession) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now()
    };
    
    const updatedMessages = [...(activeSession.messages || []), newMessage];
    
    // Optimistic UI updates are handled by standard form submission patterns,
    // but here we just wait for the db update and allow onSnapshot to update state
    setInputText('');
    
    await updateSessionMessages(activeSessionId, updatedMessages);
    
    // Simulate an AI response for visual completeness
    setTimeout(async () => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm an orchestrated AI. Received your message: "${newMessage.content}". Note: Actual LLM connection requires further server-side setup.`,
        timestamp: Date.now() + 1
      };
      await updateSessionMessages(activeSessionId, [...updatedMessages, assistantMessage]);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-neutral-900 bg-neutral-950 shrink-0">
        <div className="p-4 flex items-center gap-3 border-b border-neutral-900">
          <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-neutral-100 tracking-tight">Agent Workspace</h1>
            <p className="text-[10px] text-neutral-500 font-mono">v1.0.0-beta</p>
          </div>
        </div>
        
        <div className="p-3">
          <button
            onClick={() => createSession().then((id) => id && setActiveSessionId(id))}
            className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors rounded-lg py-2 text-sm font-medium"
          >
            <Plus size={16} /> New Session
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="text-sm text-neutral-500 text-center py-4">Syncing sessions...</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={clsx(
                  "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm",
                  activeSessionId === session.id 
                    ? "bg-indigo-500/10 text-indigo-300" 
                    : "hover:bg-neutral-900 text-neutral-400"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('Delete session?')) deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all shrink-0"
                  aria-label="Delete Session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-neutral-900 flex items-center justify-between gap-3 bg-neutral-950">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-400 shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
               <span className="text-xs font-medium text-neutral-300 truncate">{user?.email}</span>
               <span className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Synced</span>
            </div>
          </div>
          <button onClick={logout} className="p-2 hover:bg-neutral-900 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-950 relative">
         <header className="h-14 border-b border-neutral-900 flex items-center justify-between px-6 shrink-0 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
           <h2 className="font-medium text-neutral-200">
             {activeSession?.title || 'No Active Session'}
           </h2>
           <div className="flex items-center gap-3">
             <button className="text-neutral-500 hover:text-neutral-300 transition-colors">
               <Settings size={18} />
             </button>
           </div>
         </header>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col w-full max-w-4xl mx-auto">
            {(!activeSession?.messages || activeSession.messages.length === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 my-20">
                <Terminal size={48} className="mb-4 text-neutral-700" />
                <h3 className="text-lg font-medium text-neutral-300">Agent Ready</h3>
                <p className="text-sm text-neutral-500 mt-2 max-w-sm">Start a conversation. Commands and custom plugin calls will be synchronized securely.</p>
              </div>
            ) : (
              activeSession.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={clsx(
                    "flex flex-col gap-1 max-w-[85%]",
                    msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-neutral-500 px-1">
                    {msg.role === 'user' ? 'You' : 'Agent Core'}
                  </div>
                  <div className={clsx(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                    msg.role === 'user' 
                      ? "bg-neutral-800 text-neutral-100 rounded-br-sm" 
                      : "bg-indigo-500/10 text-neutral-300 border border-indigo-500/20 rounded-bl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={endOfMessagesRef} className="h-4" />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-neutral-950 shrink-0">
           <div className="max-w-4xl mx-auto relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-lg p-2">
             <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Type your message... (Shift+Enter for new line)"
               className="w-full bg-transparent text-neutral-100 placeholder-neutral-600 text-sm resize-none h-[64px] px-3 py-2 focus:outline-none scrollbar-hide"
             />
             <div className="flex justify-between items-center px-2 pt-2 border-t border-neutral-800/50">
               <div className="flex gap-2">
                 <button className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded transition-colors" title="Attach file">
                   <Plus size={16} />
                 </button>
               </div>
               <button 
                 onClick={handleSendMessage}
                 disabled={!inputText.trim()}
                 className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:hover:bg-indigo-600 p-1.5 rounded-lg transition-colors flex items-center justify-center shadow-md disabled:shadow-none"
               >
                 <Send size={16} className="ml-0.5" />
               </button>
             </div>
           </div>
           <div className="text-center mt-3 text-[10px] text-neutral-600">
             End-to-End synced using Firebase Firestore. Do not share sensitive API keys in plaintext models.
           </div>
         </div>
      </main>
    </div>
  );
}
