import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, LogIn } from 'lucide-react';

export default function LoginScreen() {
  const { login, loading } = useAuth();

  return (
    <div className="flex bg-neutral-950 text-neutral-50 h-screen w-full items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="bg-indigo-500/20 p-4 rounded-full mb-6 text-indigo-400">
          <Bot size={48} />
        </div>
        <h1 className="text-3xl font-semibold mb-2">Agent</h1>
        <p className="text-neutral-400 mb-8 max-w-sm">
          Your personal AI frontend for managing interactions, custom prompts, and local or remote LLMs.
        </p>
        
        <button
          onClick={login}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 bg-white hover:bg-neutral-200 text-black font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
        >
          <LogIn size={20} />
          {loading ? 'Initializing...' : 'Enter Agent Workspace'}
        </button>

        <button
          onClick={login}
          className="mt-3 flex w-full items-center justify-center gap-2 bg-neutral-800/80 hover:bg-neutral-700/90 text-neutral-300 text-sm font-medium py-2.5 px-4 rounded-xl border border-neutral-700/40 transition-colors"
        >
          Skip Login & Enter App
        </button>
        
        <p className="text-xs text-neutral-500 mt-6 mt-8">
          By signing in, your sessions and prompts will be synchronized across all your devices securely.
        </p>
      </div>
    </div>
  );
}
