import React, { useState } from 'react';
import { MCPConfig, SkillPlugin } from '../types';
import { Layers, Terminal, ToggleLeft, ToggleRight, Radio, RefreshCw, Key, ShieldPlus, ChevronDown, ChevronRight, PlayCircle, Plus } from 'lucide-react';

interface PluginMCPProps {
  mcpConfigs: MCPConfig[];
  skills: SkillPlugin[];
  onToggleMCP: (mcpId: string) => void;
  onToggleSkill: (skillId: string) => void;
  onAddMCP: (mcp: MCPConfig) => void;
}

export default function PluginMCP({
  mcpConfigs,
  skills,
  onToggleMCP,
  onToggleSkill,
  onAddMCP
}: PluginMCPProps) {
  const [activeTab, setActiveTab] = useState<'mcps' | 'skills'>('mcps');
  const [expandedMcpId, setExpandedMcpId] = useState<string | null>(null);
  const [isRegisteringMcp, setIsRegisteringMcp] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // New MCP state
  const [mcpName, setMcpName] = useState('');
  const [mcpUrl, setMcpUrl] = useState('');
  const [mcpDesc, setMcpDesc] = useState('');

  const handleRegisterMcpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcpName.trim() || !mcpUrl.trim()) return;

    const newMcp: MCPConfig = {
      id: 'mcp_usr_' + Date.now(),
      name: mcpName,
      url: mcpUrl,
      status: 'offline', // defaults to offline until pinged
      description: mcpDesc || 'Custom registered Model Context Protocol provider.',
      isEnabled: true,
      tools: [
        {
          name: 'custom_mcp_test_action',
          description: 'A mock generic execution trigger validated during handshake.',
          inputSchema: { type: 'object', properties: { testPayload: { type: 'string' } } },
          isEnabled: true
        }
      ]
    };

    onAddMCP(newMcp);
    setMcpName('');
    setMcpUrl('');
    setMcpDesc('');
    setIsRegisteringMcp(false);
  };

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 font-sans">
      {/* Header and Toggle Selector tabs */}
      <div className="p-3.5 border-b border-zinc-800 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-100 font-mono flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" />
          Plugin Registry
        </h2>
        <p className="text-[10px] text-zinc-500 leading-normal mb-3">Model Context Protocol tools and Sandbox plug-ins</p>
        
        <div className="grid grid-cols-2 p-1.5 bg-zinc-900/60 rounded border border-zinc-800">
          <button 
            onClick={() => setActiveTab('mcps')}
            className={`py-1 text-[10px] font-semibold tracking-wider font-mono uppercase rounded transition-all ${
              activeTab === 'mcps' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            MCP (System Tools)
          </button>
          <button 
            onClick={() => setActiveTab('skills')}
            className={`py-1 text-[10px] font-semibold tracking-wider font-mono uppercase rounded transition-all ${
              activeTab === 'skills' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Skills (Renders)
          </button>
        </div>
      </div>

      {activeTab === 'mcps' ? (
        <div className="flex-1 flex flex-col min-h-0">
          {isRegisteringMcp ? (
            <form onSubmit={handleRegisterMcpSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-[9px] font-bold text-zinc-400 font-mono uppercase tracking-wider">REGISTER CORE MCP PROTOCOL</span>
                <button 
                  type="button" 
                  onClick={() => setIsRegisteringMcp(false)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">Service Name</label>
                <input 
                  type="text"
                  required
                  value={mcpName}
                  onChange={(e) => setMcpName(e.target.value)}
                  placeholder="e.g., PostgreSQL DB Broker"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">URL Endpoint OR Client Host</label>
                <input 
                  type="url"
                  required
                  value={mcpUrl}
                  onChange={(e) => setMcpUrl(e.target.value)}
                  placeholder="http://localhost:3015"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">Broker description</label>
                <textarea 
                  value={mcpDesc}
                  onChange={(e) => setMcpDesc(e.target.value)}
                  placeholder="Exposes structural database analysis query actions to direct models..."
                  className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded p-2 text-xs focus:outline-none resize-none leading-normal"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 font-mono text-[11px] font-semibold rounded uppercase tracking-wider shadow transition-all active:scale-95"
              >
                Assemble Handshake Endpoint
              </button>
            </form>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-3 border-b border-zinc-900 flex items-center justify-between shrink-0">
                <span className="text-[8px] font-bold text-zinc-600 tracking-widest font-mono uppercase">SERVERS IN DISCOVERY</span>
                <button 
                  onClick={() => setIsRegisteringMcp(true)}
                  className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono uppercase font-bold"
                >
                  <Plus size={10} /> Add Server
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin">
                {mcpConfigs.map(mcp => {
                  const isExpanded = expandedMcpId === mcp.id;
                  const isTesting = testingId === mcp.id;
                  return (
                    <div key={mcp.id} className="bg-zinc-950 rounded border border-zinc-900 overflow-hidden shadow-sm shadow-zinc-950">
                      {/* MCP Header row */}
                      <div className="p-3 bg-zinc-900/30 flex items-center justify-between gap-2 border-b border-zinc-900">
                        <div className="flex items-center space-x-2.5 truncate min-w-0">
                          <button 
                            onClick={() => onToggleMCP(mcp.id)}
                            className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            {mcp.isEnabled ? (
                              <ToggleRight size={22} className="text-cyan-500" />
                            ) : (
                              <ToggleLeft size={22} />
                            )}
                          </button>
                          <div className="truncate flex flex-col">
                            <span className="text-[11px] font-mono font-medium text-zinc-200 truncate leading-none">
                              {mcp.name}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono truncate mt-0.5 leading-none">
                              {mcp.url}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {/* Connection indicator */}
                          <div className="flex items-center scale-90">
                            {mcp.status === 'connected' ? (
                              <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded leading-none shrink-0 uppercase">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live
                              </span>
                            ) : (
                              <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded leading-none shrink-0 uppercase">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                                Offline
                              </span>
                            )}
                          </div>

                          <button 
                            onClick={() => setExpandedMcpId(isExpanded ? null : mcp.id)}
                            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
                          >
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="p-3 bg-zinc-900/10 text-[10px] space-y-2.5 border-t border-zinc-900/60 animate-in fade-in duration-200 select-text">
                          <p className="text-zinc-400 leading-normal">{mcp.description}</p>
                          
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold">Tools Exposed ({mcp.tools.length})</span>
                            <button
                              onClick={() => handleTestConnection(mcp.id)}
                              className={`px-2 py-0.5 border text-[9px] font-mono rounded flex items-center gap-1 ${
                                isTesting 
                                  ? 'bg-indigo-950 border-indigo-700 text-indigo-400'
                                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                              }`}
                            >
                              <RefreshCw size={8} className={isTesting ? "animate-spin" : ""} />
                              {isTesting ? "Testing ping..." : "Check Handshake"}
                            </button>
                          </div>

                          {mcp.tools.length > 0 && (
                            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin font-mono text-[9px]">
                              {mcp.tools.map((tool, idx) => (
                                <div key={idx} className="p-1.5 bg-zinc-950 border border-zinc-900/60 rounded space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-cyan-400 font-semibold font-mono leading-none">{tool.name}</span>
                                    <span className="text-[7px] text-zinc-600 leading-none">JSON SCHEMA</span>
                                  </div>
                                  <p className="text-[8.5px] text-zinc-500 leading-normal">{tool.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin select-none">
          <span className="text-[8px] font-bold text-zinc-600 tracking-widest font-mono uppercase">SANDBOX PLUG-INS</span>
          
          <div className="space-y-3">
            {skills.map(skill => (
              <div 
                key={skill.id}
                className={`p-3 rounded border transition-all ${
                  skill.isEnabled 
                    ? 'bg-zinc-900/50 border-zinc-750 shadow-sm shadow-indigo-950/20' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <div className={`p-2 rounded mt-0.5 ${skill.isEnabled ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/50' : 'bg-zinc-900 text-zinc-500'}`}>
                      <Terminal size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-mono font-semibold ${skill.isEnabled ? 'text-zinc-100' : 'text-zinc-500'}`}>
                          {skill.name}
                        </span>
                        <span className="text-[8px] px-1 py-[0.5px] bg-zinc-800 text-zinc-400 border border-zinc-700/60 rounded">
                          {skill.category}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-zinc-400 mt-1 leading-normal font-sans pr-1">
                        {skill.description}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onToggleSkill(skill.id)}
                    className="shrink-0 text-zinc-500 hover:text-zinc-300"
                  >
                    {skill.isEnabled ? (
                      <ToggleRight size={22} className="text-cyan-500" />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
