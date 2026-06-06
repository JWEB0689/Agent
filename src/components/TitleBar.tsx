import React, { useState } from 'react';
import { Bot, Terminal, Shield, Sparkles, Minus, Square, X, RefreshCw } from 'lucide-react';

interface TitleBarProps {
  activeModelName: string;
  providerName: string;
  onRefreshStatus?: () => void;
  isSyncing?: boolean;
}

export default function TitleBar({
  activeModelName,
  providerName,
  onRefreshStatus,
  isSyncing = false
}: TitleBarProps) {
  const [windowState, setWindowState] = useState<'normal' | 'maximized'>('normal');
  const [showExitHint, setShowExitHint] = useState(false);

  const handleCloseClick = () => {
    setShowExitHint(true);
    setTimeout(() => setShowExitHint(false), 4000);
  };

  return (
    <div className="relative select-none h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 text-xs text-zinc-400 font-sans z-50">
      {/* Left: Window Icon and Branding */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-950">
          <Bot size={14} className="animate-pulse" />
        </div>
        <span className="font-mono text-zinc-100 font-semibold tracking-wider text-[11px] uppercase flex items-center gap-1.5">
          Agent
          <span className="px-1 text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-normal lowercase tracking-normal">
            win-v1.2
          </span>
        </span>
      </div>

      {/* Middle: Connection Status & Search Bar */}
      <div className="hidden md:flex items-center space-x-4 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full w-96 max-w-lg transition-all focus-within:border-zinc-700">
        <Terminal size={12} className="text-zinc-500 shrink-0" />
        <span className="text-[10px] text-zinc-400 truncate shrink-0 max-w-[120px]">
          {providerName}:
        </span>
        <span className="text-[10px] text-cyan-400 font-mono font-medium truncate">
          {activeModelName}
        </span>
        <div className="h-2 w-[1px] bg-zinc-800 shrink-0" />
        <span className="text-[9px] text-emerald-400 font-mono tracking-tighter flex items-center gap-1 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SERVICE LIVE (3000)
        </span>
      </div>

      {/* Right: Actions, Sync indicator & Mock OS Buttons */}
      <div className="flex items-center space-x-3">
        {isSyncing && (
          <div className="flex items-center space-x-1.5 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded text-[9px] text-indigo-300">
            <RefreshCw size={10} className="animate-spin" />
            <span className="font-mono scale-95 origin-left">Syncing cluster...</span>
          </div>
        )}

        <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

        {/* Windows 11 Fluent App Control Mockups */}
        <div className="flex items-center space-x-0.5">
          <button 
            title="Minimize to System Tray"
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-zinc-800/80 transition-colors text-zinc-400 active:scale-95"
          >
            <Minus size={11} />
          </button>
          <button 
            title={windowState === 'maximized' ? 'Restore Window' : 'Maximize Workspace'}
            onClick={() => setWindowState(prev => prev === 'maximized' ? 'normal' : 'maximized')}
            className={`w-8 h-8 rounded flex items-center justify-center hover:bg-zinc-800/80 transition-colors text-zinc-400 active:scale-95 ${windowState === 'maximized' ? 'bg-zinc-800' : ''}`}
          >
            <Square size={10} />
          </button>
          <button 
            title="Close Application Process"
            onClick={handleCloseClick}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-rose-950/80 hover:text-rose-100 transition-colors text-zinc-400 active:scale-95"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Slide-out alert when mock closing */}
      {showExitHint && (
        <div className="absolute right-4 top-14 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-3 max-w-sm text-zinc-300 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="flex items-start space-x-2.5">
            <Shield size={16} className="text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[11px] text-zinc-100 font-semibold">Background Process Active</p>
              <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                To maintain local filesystem MCP mappings and remote sync subscriptions, the 
                <strong className="text-zinc-300"> Agent</strong> core process has been minimized to your Windows system tray instead of exiting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
