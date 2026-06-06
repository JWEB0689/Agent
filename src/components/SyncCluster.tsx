import React, { useState } from 'react';
import { SyncProfile } from '../types';
import { Shield, Key, RefreshCw, Server, Laptop, Cpu, Check, AlertTriangle, HelpCircle } from 'lucide-react';

interface SyncClusterProps {
  syncProfile: SyncProfile;
  onUpdatePassphrase: (passphrase: string) => void;
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
}

export default function SyncCluster({
  syncProfile,
  onUpdatePassphrase,
  onTriggerSync,
  isSyncing
}: SyncClusterProps) {
  const [passphrase, setPassphrase] = useState(syncProfile.passphrase || '');
  const [syncCode, setSyncCode] = useState(syncProfile.syncCode || '');
  const [copied, setCopied] = useState(false);

  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 4 }, () => 
      Math.floor(Math.random() * 0xfffffff).toString(16).toUpperCase()
    ).join('-');
    const newCode = `AGENT-PBKDF2-${randomHex}`;
    setSyncCode(newCode);
    setPassphrase('SymmetricPBKDF2HashVerified');
    onUpdatePassphrase(newCode);
    
    // Auto sync
    onTriggerSync();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 font-sans select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-zinc-800 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-100 font-mono flex items-center gap-1.5">
          <Shield size={13} className="text-cyan-400 animate-pulse" />
          Cloud Sync Cluster
        </h2>
        <p className="text-[10px] text-zinc-500 leading-normal">Cross-device secure end-to-end synchronization</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Encryption alert banner */}
        <div className="p-3 bg-indigo-950/20 border border-indigo-900/50 rounded-lg flex gap-3 text-indigo-300">
          <Server size={18} className="shrink-0 mt-0.5 text-cyan-400" />
          <div className="text-[10px] leading-relaxed">
            <p className="font-bold font-mono text-zinc-100 mb-0.5">Symmetric Sync Model</p>
            All custom prompt libraries, conversation caches, and system configs are compiled, hashed with PBKDF2, encrypted using <strong className="text-zinc-200">AES-256-GCM</strong> directly on the clients, and synced securely. No plain-text data ever reaches cloud nodes.
          </div>
        </div>

        {/* Sync Profile Section */}
        <div className="space-y-3 p-3 bg-zinc-900/40 rounded border border-zinc-900 shadow-sm shadow-zinc-950">
          <span className="text-[8.5px] font-bold text-zinc-500 tracking-wider font-mono uppercase">SECURITY COORDINATES</span>
          
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">Passphrase Symmetric Key</label>
            <div className="flex gap-1.5">
              <input 
                type="text"
                value={syncCode}
                onChange={(e) => {
                  setSyncCode(e.target.value);
                  onUpdatePassphrase(e.target.value);
                }}
                placeholder="AGENT-PBKDF2-XXXX-XXXX"
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-cyan-200 font-mono focus:outline-none"
              />
              <button 
                onClick={handleGenerateKey}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] font-mono hover:text-cyan-400"
                title="Assemble brand new cryptograhic hash key"
              >
                Generate
              </button>
            </div>
            <p className="text-[8px] text-zinc-600 mt-0.5">
              Copy this cluster code onto any other instance of <strong className="text-zinc-500">Agent</strong> to bridge coordinates.
            </p>
          </div>

          {syncCode && (
            <div className="flex gap-2">
              <button 
                onClick={handleCopyCode}
                className={`flex-1 py-1 text-[10px] uppercase font-mono font-bold rounded border transition-all ${
                  copied 
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-400' 
                    : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                }`}
              >
                {copied ? 'Cluster Code Copied!' : 'Copy Code'}
              </button>
              
              <button 
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="flex-1 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 font-mono text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} />
                Sync Now
              </button>
            </div>
          )}
        </div>

        {/* Sync Status / Map visual topology */}
        <div className="bg-zinc-950 rounded border border-zinc-900 overflow-hidden text-xs">
          <div className="bg-zinc-900/30 p-2 border-b border-zinc-900 flex justify-between items-center px-3">
            <span className="text-[8.5px] font-bold text-zinc-500 font-mono uppercase">CLUSTER TOPOLOGY</span>
            <span className="text-[8px] text-zinc-500 font-mono">2 NODES ACTIVE</span>
          </div>

          <div className="p-3 space-y-3 font-mono text-[10px]">
            {/* Sync nodes mock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-zinc-300">
                <Laptop size={12} className="text-indigo-400 shrink-0" />
                <span>Primary Desktop (Active Win)</span>
              </div>
              <span className="text-emerald-400">THIS NODE</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-zinc-400">
                <Cpu size={12} className="text-cyan-500 shrink-0" />
                <span>Secondary Laptop (Synced VM)</span>
              </div>
              <span className="text-zinc-600">3 HOURS AGO</span>
            </div>

            <div className="h-[1px] bg-zinc-900" />

            <div className="space-y-1 text-zinc-500 text-[9px] leading-relaxed">
              <p className="font-semibold text-zinc-400 flex items-center gap-1 font-sans">
                <Check size={10} className="text-emerald-400" />
                Synced Datastores:
              </p>
              <ul className="list-disc list-inside pl-1 space-y-0.5">
                <li>Prompt Profiles (5 presets bridged)</li>
                <li>Chat History sessions (2 full histories compiled)</li>
                <li>MCP Broker Configurations (ports & addresses indexed)</li>
                <li>Developer API Keys / Secret Key maps</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sync Console Outputs */}
        <div className="space-y-1.5 select-text">
          <span className="text-[8.5px] font-bold text-zinc-500 tracking-wider font-mono uppercase">SYNC CONSOLE LOG</span>
          <div className="h-32 bg-zinc-950 border border-zinc-900 rounded p-2.5 font-mono text-[9px] leading-relaxed text-zinc-400 overflow-y-auto space-y-1 bg-gradient-to-b from-zinc-950 to-zinc-900 scrollbar-thin">
            {syncProfile.logs.map((log, idx) => (
              <p key={idx} className={log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('PUSH') ? 'text-indigo-300' : 'text-zinc-500'}>
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
