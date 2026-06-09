import React from 'react';
import { RTKConfiguration } from '../types';
import { Settings, Cpu, Zap, Activity, ShieldCheck, Database, Sliders } from 'lucide-react';

interface RTKOptimizerProps {
  config: RTKConfiguration | undefined;
  onUpdate: (config: RTKConfiguration) => void;
}

export default function RTKOptimizer({ config, onUpdate }: RTKOptimizerProps) {
  if (!config) return null;

  return (
    <div className="bg-zinc-950 text-zinc-300 font-sans p-4 rounded-xl shadow-lg border border-zinc-900 w-full max-w-lg mb-6 shadow-indigo-900/10 transition-all">
      <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/80 pb-3">
        <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/50">
          <Zap size={18} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2 tracking-tight">
            RTK Optimization Engine
            {config.enabled && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>}
          </h3>
          <p className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 mt-0.5">Real-Time Knowledge Context Compressor</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <Cpu size={16} className="text-zinc-400" />
            <div>
              <p className="text-xs font-semibold text-zinc-200">Enable RTK Pipeline</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight max-w-[200px]">Compresses context automatically to save token costs during long multi-turn sessions.</p>
            </div>
          </div>
          <button 
            onClick={() => onUpdate({ ...config, enabled: !config.enabled })}
            className={`w-10 h-5 rounded-full relative transition-colors ${config.enabled ? 'bg-emerald-600' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* Compression & Sliding Window Controls - Disabled if RTK is off */}
        <div className={`space-y-4 transition-opacity ${config.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-zinc-300">Context Compression Ratio</span>
              <span className="font-mono text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded">{Math.round(config.compressionRatio * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" max="1.0" step="0.05"
              value={config.compressionRatio}
              onChange={(e) => onUpdate({ ...config, compressionRatio: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
            />
          </div>

          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-zinc-300">Active Token Window (Sliding)</span>
              <span className="font-mono text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded">{config.slidingWindowSize} tkns</span>
            </div>
            <input 
              type="range" 
              min="500" max="128000" step="500"
              value={config.slidingWindowSize}
              onChange={(e) => onUpdate({ ...config, slidingWindowSize: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
            />
          </div>

          {/* Autonomous Bypass Strategy Component */}
          <div className="mt-2 p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <ShieldCheck size={64} />
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              <Activity size={16} className="text-indigo-400" />
              <h4 className="text-xs font-semibold text-indigo-300 tracking-wide uppercase font-mono">Autonomous API Bypass</h4>
            </div>
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Dynamic Key Substitution</span>
                <button 
                  onClick={() => onUpdate({ ...config, dynamicBypass: !config.dynamicBypass })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${config.dynamicBypass ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${config.dynamicBypass ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              
              <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider font-mono">Fallback Routing Protocol</span>
                
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'local_fallback', label: 'Local Core', icon: Database },
                    { id: 'cloud_orchestrator', label: 'Cloud Proxy', icon: Sliders },
                    { id: 'mcp_bridged', label: 'MCP Bridged', icon: Settings }
                  ].map((route) => {
                    const isSelected = config.modelRoute === route.id;
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.id}
                        onClick={() => onUpdate({ ...config, modelRoute: route.id as any })}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border text-[9px] font-mono transition-all ${
                          isSelected 
                          ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-indigo-400' : ''} />
                        <span className="text-center truncate w-full">{route.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
