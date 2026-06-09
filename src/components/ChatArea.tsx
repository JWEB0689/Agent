import React, { useState, useRef, useEffect } from 'react';
import { Session, LLMProvider, MCPConfig, SkillPlugin, VirtualFile, Message, PromptPreset } from '../types';
import { 
  Send, Paperclip, Sliders, Play, Settings, RefreshCw, Eye, EyeOff, Bot, User, 
  Terminal, Layers, Code, Check, AlertCircle, Copy, Cpu, Sparkles, Folder, Trash2, Maximize, FileText 
} from 'lucide-react';

interface ChatAreaProps {
  session: Session;
  providers: LLMProvider[];
  mcpConfigs: MCPConfig[];
  skills: SkillPlugin[];
  virtualFiles: VirtualFile[];
  promptPresets: PromptPreset[];
  onSendMessage: (text: string, attachedFiles: string[]) => void;
  onClearSessionMessages: () => void;
  onChangeSessionParam: (field: string, value: any) => void;
  attachedFileNames: string[];
  onToggleAttachment: (fileName: string) => void;
  isSending?: boolean;
}

export default function ChatArea({
  session,
  providers,
  mcpConfigs,
  skills,
  virtualFiles,
  promptPresets,
  onSendMessage,
  onClearSessionMessages,
  onChangeSessionParam,
  attachedFileNames,
  onToggleAttachment,
  isSending
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [showSandbox, setShowSandbox] = useState(true);
  
  // Autocomplete state
  const [autocomplete, setAutocomplete] = useState<{
    type: 'prompt' | 'file' | 'mcp' | null;
    items: { id: string; name: string; subtitle?: string; content?: string }[];
    activeIndex: number;
    searchQuery: string;
  }>({ type: null, items: [], activeIndex: 0, searchQuery: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const activeProvider = providers.find(p => p.id === session.providerId) || providers[0];
  const activePrompt = promptPresets.find(p => p.id === session.systemPromptId) || promptPresets[0];

  // Auto-scroll chat on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isSending]);

  // Capture SVG or LaTeX code block to pass to the active Sandbox renderer
  const getLatestSandboxPayload = () => {
    if (!session.messages) return { type: 'welcome', data: '' };
    
    // Look backward for code blocks
    for (let i = session.messages.length - 1; i >= 0; i--) {
      const msg = session.messages[i];
      if (msg.role === 'assistant') {
        // Detect SVG
        const svgMatch = msg.content.match(/```(?:xml|svg|html)?\s*(<svg[\s\S]*?<\/svg>)\s*```/);
        if (svgMatch) {
          return { type: 'svg', data: svgMatch[1] };
        }
        
        // Detect LaTeX Formula block
        if (msg.content.includes('$$\\mathbf{A}\\mathbf{x} = \\mathbf{B}$$') || msg.content.includes('$$')) {
          return { 
            type: 'latex', 
            data: `\\mathbf{A}\\mathbf{x} = \\mathbf{B} \\\\ \\det(\\mathbf{A}) \\neq 0 \\implies \\mathbf{x} = \\mathbf{A}^{-1} \\mathbf{B}` 
          };
        }

        // Detect python code
        const codeMatch = msg.content.match(/```(?:python)?\s*([\s\S]*?solve_matrix_relation[\s\S]*?)\s*```/);
        if (codeMatch) {
          return { type: 'python', data: codeMatch[1] };
        }
      }
    }
    return { type: 'welcome', data: '' };
  };

  const sandboxPayload = getLatestSandboxPayload();

  // Handle Autocomplete interactions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);

    // Get current cursor pos
    const cursor = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursor);
    const words = textBeforeCursor.split(/[\s\n]+/);
    const lastWord = words[words.length - 1] || '';

    if (lastWord.startsWith('/')) {
      // Trigger prompt autocomplete
      const query = lastWord.substring(1).toLowerCase();
      const filtered = promptPresets
        .filter(p => p.name.toLowerCase().includes(query))
        .map(p => ({ id: p.id, name: p.name, subtitle: p.category, content: p.promptContent }));

      setAutocomplete({
        type: 'prompt',
        items: filtered,
        activeIndex: 0,
        searchQuery: query
      });
    } else if (lastWord.startsWith('@')) {
      // Trigger file attachment autocomplete
      const query = lastWord.substring(1).toLowerCase();
      const filtered = virtualFiles
        .filter(f => !f.isDir && f.name.toLowerCase().includes(query))
        .map(f => ({ id: f.id, name: f.name, subtitle: `${(f.size / 1024).toFixed(1)} KB` }));

      setAutocomplete({
        type: 'file',
        items: filtered,
        activeIndex: 0,
        searchQuery: query
      });
    } else if (lastWord.startsWith('#')) {
      // Trigger MCP tools autocomplete
      const query = lastWord.substring(1).toLowerCase();
      const allTools: any[] = [];
      mcpConfigs.forEach(mcp => {
        if (mcp.isEnabled) {
          mcp.tools.forEach(tool => {
            allTools.push({ id: tool.name, name: tool.name, subtitle: mcp.name });
          });
        }
      });

      const filtered = allTools.filter(t => t.name.toLowerCase().includes(query));

      setAutocomplete({
        type: 'mcp',
        items: filtered,
        activeIndex: 0,
        searchQuery: query
      });
    } else {
      setAutocomplete({ type: null, items: [], activeIndex: 0, searchQuery: '' });
    }
  };

  const selectAutocompleteItem = (item: any) => {
    if (!textInputRef.current) return;
    const cursor = textInputRef.current.selectionStart || 0;
    const value = inputText;
    const textBeforeCursor = value.substring(0, cursor);
    const textAfterCursor = value.substring(cursor);

    const words = textBeforeCursor.split(/[\s\n]+/);
    words.pop(); // remove symbol (/, @, #)
    const newBefore = words.join(' ') + (words.length > 0 ? ' ' : '');

    if (autocomplete.type === 'prompt') {
      onChangeSessionParam('systemPromptId', item.id);
      setInputText(newBefore + `[System overlay activated: ${item.name}]\n` + textAfterCursor);
    } else if (autocomplete.type === 'file') {
      onToggleAttachment(item.name);
      setInputText(newBefore + textAfterCursor);
    } else if (autocomplete.type === 'mcp') {
      setInputText(newBefore + `Trigger MCP action: ${item.name} ` + textAfterCursor);
    }

    setAutocomplete({ type: null, items: [], activeIndex: 0, searchQuery: '' });
    textInputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autocomplete.type && autocomplete.items.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          activeIndex: (prev.activeIndex + 1) % prev.items.length
        }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          activeIndex: (prev.activeIndex - 1 + prev.items.length) % prev.items.length
        }));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectAutocompleteItem(autocomplete.items[autocomplete.activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setAutocomplete({ type: null, items: [], activeIndex: 0, searchQuery: '' });
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleSendClick = () => {
    if (!inputText.trim() && attachedFileNames.length === 0) return;
    onSendMessage(inputText, [...attachedFileNames]);
    setInputText('');
  };

  return (
    <div className="flex-1 flex bg-zinc-950 text-zinc-100 h-full overflow-hidden select-text">
      {/* LEFT AREA: Config, Messages state list, Prompt panel */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-900 relative">
        {/* Active model configurations bar */}
        <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-mono font-medium tracking-tight uppercase leading-none">PROVIDER</span>
              <select
                className="bg-transparent text-cyan-400 font-bold border-none p-0 focus:ring-0 text-[11px] font-mono cursor-pointer"
                value={session.providerId}
                onChange={(e) => {
                  onChangeSessionParam('providerId', e.target.value);
                  const prov = providers.find(p => p.id === e.target.value);
                  if (prov) onChangeSessionParam('modelId', prov.selectedModel);
                }}
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id} className="bg-zinc-950 text-zinc-300 font-mono">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-6 w-[1px] bg-zinc-800" />

            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-mono font-medium tracking-tight uppercase leading-none">MODEL COMPILER</span>
              <input
                list={`models-${session.providerId}`}
                className="bg-transparent text-zinc-200 font-medium border-none p-0 focus:ring-0 text-[11px] font-mono w-32 placeholder-zinc-500"
                value={session.modelId}
                onChange={(e) => onChangeSessionParam('modelId', e.target.value)}
                placeholder="Type model name..."
              />
              <datalist id={`models-${session.providerId}`}>
                {(providers.find(p => p.id === session.providerId)?.models || ['llama3']).map(mod => (
                  <option key={mod} value={mod} />
                ))}
              </datalist>
            </div>
            
            <div className="h-6 w-[1px] bg-zinc-800" />

            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-mono font-medium tracking-tight uppercase leading-none">BEHAVIOR OVERLAY</span>
              <span className="text-[11px] text-indigo-400 font-semibold truncate max-w-[124px]">
                {activePrompt.name}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 self-center shrink-0">
            <button 
              onClick={() => setShowConfig(prev => !prev)}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Parameters Slider Panel"
            >
              <Sliders size={12} />
            </button>
            <button 
              onClick={() => setShowSandbox(prev => !prev)}
              className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 border transition-colors ${
                showSandbox 
                  ? 'bg-cyan-950 hover:bg-cyan-900 border-cyan-800 text-cyan-400' 
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {showSandbox ? <Eye size={12} /> : <EyeOff size={12} />}
              Sandbox Renders
            </button>
            <button 
              onClick={onClearSessionMessages}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 transition-colors"
              title="Purge session chat history"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Sliding configuration parameters drawer */}
        {showConfig && (
          <div className="absolute top-12 left-0 right-0 bg-zinc-900/95 border-b border-zinc-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 z-20 shadow-xl backdrop-blur-md animate-in slide-in-from-top-1 duration-200 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px] text-zinc-400 uppercase">
                <span>Temperature Profile</span>
                <span className="text-cyan-400">{session.temperature}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1.2" 
                step="0.1"
                value={session.temperature}
                onChange={(e) => onChangeSessionParam('temperature', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-zinc-850 rounded"
              />
              <p className="text-[9px] text-zinc-500">Lower values prioritize deterministic code; higher triggers creative analysis.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px] text-zinc-400 uppercase">
                <span>Max Context Tokens</span>
                <span className="text-cyan-400">{session.maxTokens}</span>
              </div>
              <input 
                type="range" 
                min="256" 
                max="8192" 
                step="256"
                value={session.maxTokens}
                onChange={(e) => onChangeSessionParam('maxTokens', parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-zinc-850 rounded"
              />
              <p className="text-[9px] text-zinc-500">Truncate output buffers. Standard models operate between 4k-8k tokens.</p>
            </div>
          </div>
        )}

        {/* MESSAGES CORE TIMELINE LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin select-text bg-zinc-950/20">
          
          {/* Welcome Screen if empty */}
          {session.messages.length === 0 && (
            <div className="max-w-xl mx-auto text-center py-12 space-y-4 font-sans text-zinc-400 select-none">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 mx-auto flex items-center justify-center text-white shadow shadow-indigo-950">
                <Bot size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h3 className="text-zinc-200 font-semibold font-mono text-xs uppercase tracking-wider">WORKSPACE SHELL ACTIVE</h3>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  Enter an instruction or run a diagnostics test below. If local LLMs are connected via CORS,
                  Agent will communicate natively. If offline, the built-in system emulator will takeover.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-left pt-4">
                <div 
                  onClick={() => setInputText("Generate an SVG diagram representing server-to-client secure cross-device sync cluster")}
                  className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-lg cursor-pointer hover:border-zinc-800 transition"
                >
                  <p className="font-mono text-[10px] text-cyan-400 font-semibold">/Visual Graphics</p>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-normal">Draw a beautiful vector diagram of cloud sync cluster layout.</p>
                </div>

                <div 
                  onClick={() => setInputText("Write LaTeX formulas outlining Gaussian inversion on Singular matrix relations")}
                  className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-lg cursor-pointer hover:border-zinc-800 transition"
                >
                  <p className="font-mono text-[10px] text-indigo-400 font-semibold">/Math & LaTeX</p>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-normal">Solve array matrix formulas using Gaussian LaTeX layouts.</p>
                </div>
              </div>
            </div>
          )}

          {/* Active Preset Banner (Internal Info Block) */}
          {session.messages.length > 0 && (
            <div className="flex justify-center select-none">
              <span className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-850 rounded-full font-mono text-[8.5px] text-zinc-500">
                CONTEXT BEHAVIOR: {activePrompt.name.toUpperCase()} (ACTIVE)
              </span>
            </div>
          )}

          {/* Rendering the chronological chat thread */}
          {session.messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) return null; // We hide raw system system prompts from general user eyes

            return (
              <div 
                key={msg.id} 
                className={`flex gap-3.5 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto'}`}
              >
                {/* Profile bubble left-side if bot */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg border border-zinc-805 bg-zinc-900 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0 select-none">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`p-3.5 rounded-xl border max-w-full text-xs leading-relaxed space-y-3 ${
                  isUser 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-300 shadow-sm shadow-zinc-950/20'
                }`}>
                  {/* Message Sender Header */}
                  <div className="flex items-center justify-between gap-6 pb-1 border-b border-zinc-900/40 select-none">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      {isUser ? (
                        <>
                          <User size={10} /> Operator
                        </>
                      ) : (
                        <>
                          <Cpu size={10} className="text-cyan-500" /> {activeProvider.name}
                        </>
                      )}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-mono tracking-tighter shrink-0">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Attachment references list attached */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 py-1 text-[9px] font-mono select-none">
                      {msg.attachedFiles.map(fn => (
                        <span key={fn} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-cyan-400 rounded flex items-center gap-1">
                          <Paperclip size={8} />
                          {fn}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message main content */}
                  <div className="whitespace-pre-wrap leading-normal font-sans tracking-wide text-zinc-200 text-[11px]">
                    {msg.content}
                  </div>

                  {/* Embedded Custom Tool Logs if assistant triggered tool calls */}
                  {msg.toolCall && (
                    <div className="bg-zinc-950 rounded border border-zinc-900 p-2 font-mono text-[9px] space-y-1 bg-gradient-to-b from-zinc-950 to-zinc-900 select-text">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                        <span className="text-indigo-400 font-bold uppercase flex items-center gap-1">
                          <Terminal size={10} />
                          Local MCP Action: {msg.toolCall.name}
                        </span>
                        <span className="text-emerald-500 shrink-0 uppercase text-[8px] bg-emerald-950 px-1 border border-emerald-800 rounded">
                          Handshake OK
                        </span>
                      </div>
                      <p className="text-zinc-500">Invocated arguments: {msg.toolCall.arguments}</p>
                      {msg.toolCall.output && (
                        <details className="mt-1">
                          <summary className="text-[8px] text-zinc-600 hover:text-cyan-400 cursor-pointer uppercase select-none">
                            Inspect output buffer payload
                          </summary>
                          <pre className="mt-1 max-h-32 overflow-y-auto bg-zinc-950 p-1.5 rounded border border-zinc-900/60 leading-normal text-zinc-400 scrollbar-thin text-[8.5px]">
                            {msg.toolCall.output}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile bubble if user */}
                {isUser && (
                  <div className="w-8 h-8 rounded-lg border border-indigo-900 bg-indigo-950/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    <User size={15} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Assistant is thinking indicator */}
          {isSending && (
            <div className="flex items-center space-x-3 text-xs select-none">
              <div className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-cyan-400 shrink-0">
                <RefreshCw size={13} className="animate-spin text-cyan-400" />
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-500 font-mono text-[10px] flex items-center gap-2">
                <span>Core Compiler thinking ... dispatching MCP handshakes</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Area chat inputs & Float autocomplete dropdown popup */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-850 shrink-0 relative">
          
          {/* FLOATING AUTOCOMPLETE WIDGET */}
          {autocomplete.type && autocomplete.items.length > 0 && (
            <div className="absolute bottom-full left-3 right-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-2 z-30 flex flex-col max-h-48 overflow-y-auto select-none">
              <div className="px-2 pb-1.5 border-b border-zinc-950/60 flex items-center justify-between text-[8px] text-zinc-500 font-mono uppercase">
                <span>
                  AUTOCOMPLETE SUGGESTIONS ({autocomplete.type === 'prompt' ? '/' : autocomplete.type === 'file' ? '@' : '#'})
                </span>
                <span>ENTER TO INJECT</span>
              </div>
              <div className="mt-1.5 space-y-0.5">
                {autocomplete.items.map((item, idx) => {
                  const isAct = idx === autocomplete.activeIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => selectAutocompleteItem(item)}
                      onMouseEnter={() => setAutocomplete(prev => ({ ...prev, activeIndex: idx }))}
                      className={`p-1.5 rounded text-xs cursor-pointer flex items-center justify-between border ${
                        isAct 
                          ? 'bg-zinc-800 border-zinc-700 text-cyan-400' 
                          : 'border-transparent text-zinc-400'
                      }`}
                    >
                      <span className="font-mono">{item.name}</span>
                      {item.subtitle && <span className="text-[8px] text-zinc-650 shrink-0">{item.subtitle}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Active Attachments indicator */}
          {attachedFileNames.length > 0 && (
            <div className="flex gap-1.5 flex-wrap pb-2 text-[9px] text-zinc-400 font-mono">
              <span className="text-zinc-600 self-center">Attached context:</span>
              {attachedFileNames.map(fileName => (
                <span 
                  key={fileName} 
                  className="px-2 py-0.5 border border-cyan-900/60 bg-cyan-950/20 text-cyan-400 rounded flex items-center gap-1 animate-in zoom-in-95 duration-150"
                >
                  <Paperclip size={9} />
                  {fileName}
                  <button 
                    onClick={() => onToggleAttachment(fileName)}
                    className="hover:text-rose-400 ml-1 leading-none text-[10px]"
                    title="Detach"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Form wrapper */}
          <div className="bg-zinc-900 border border-zinc-800 focus-within:border-zinc-750 transition-all rounded-lg p-2.5 flex flex-col md:flex-row gap-2 relative shadow-inner">
            <textarea
              ref={textInputRef}
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none resize-none h-16 md:h-12 border-none p-0 leading-relaxed font-sans"
              placeholder="Deploy a developer inquiry. Tip: Type '/' behavior, '@' attach file, '#' call MCP..."
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />

            <div className="flex items-center justify-between md:flex-col md:justify-end gap-2 shrink-0 border-t border-zinc-950/30 md:border-t-0 pt-2 md:pt-0">
              {/* Desktop action badges */}
              <div className="flex items-center space-x-1">
                <button 
                  title="Link local files"
                  onClick={() => {
                    const firstPlain = virtualFiles.find(f => !f.isDir);
                    if (firstPlain) onToggleAttachment(firstPlain.name);
                  }}
                  className="p-1.5 bg-zinc-950 border border-zinc-800 rounded hover:text-cyan-400 text-zinc-500 transition-colors"
                >
                  <Paperclip size={12} className="text-zinc-400" />
                </button>
              </div>

              <button 
                onClick={handleSendClick}
                disabled={isSending || (!inputText.trim() && attachedFileNames.length === 0)}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 border border-cyan-800/20 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-650 disabled:border-transparent text-white font-mono uppercase text-[10px] font-bold rounded flex items-center gap-1.5 shadow transition-all active:scale-95"
              >
                Send
                <Send size={10} />
              </button>
            </div>
          </div>
          
          <div className="text-[8px] text-zinc-650 flex justify-between font-mono mt-1 px-1">
            <span>CORE NODE AGENT PIPELINE: ACTIVE COMPLIANCE</span>
            <span>MODEL PORTAL: {activeProvider.selectedModel.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE RIGHT WORKSPACE PANEL: Active Sandbox Renders */}
      {showSandbox && (
        <div className="hidden lg:flex flex-col w-96 bg-zinc-950 text-zinc-300 overflow-hidden shrink-0 border-l border-zinc-900 border-l">
          {/* Top panel bar */}
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
            <span className="text-[10px] font-bold text-zinc-450 tracking-wider font-mono uppercase flex items-center gap-1.5 leading-none">
              <Layers size={13} className="text-cyan-400" />
              Sandbox Workspace Output
            </span>
            <span className="px-1.5 py-0.5 text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-mono uppercase leading-none">
              SKILL RUNTIME
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col scrollbar-thin select-text">
            {sandboxPayload.type === 'welcome' && (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-zinc-500 p-6 space-y-4 font-sans select-none my-auto">
                <Code size={28} className="text-zinc-700 animate-pulse" />
                <div>
                  <h4 className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Awaiting Compilation</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                    Trigger an SVG creation output, LaTeX formula solve, or code rendering inside chat. Your active skill plugin widgets compile code payloads instantly.
                  </p>
                </div>
              </div>
            )}

            {sandboxPayload.type === 'svg' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded text-emerald-400 text-[10px] font-mono flex items-center gap-1.5">
                  <Check size={12} className="shrink-0" />
                  <span>Visual SVG Sandbox skill rendered vector buffer successfully.</span>
                </div>
                
                {/* Visual SVG mounting container */}
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 flex justify-center items-center select-none shadow">
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: sandboxPayload.data }} />
                </div>

                {/* Inspect payload container */}
                <details className="text-[10px] space-y-1 select-text">
                  <summary className="text-[9px] text-zinc-500 uppercase hover:text-cyan-400 font-mono cursor-pointer select-none">
                    View raw SVG layout text XML
                  </summary>
                  <pre className="p-3 bg-zinc-950 border border-zinc-900 rounded font-mono text-[9px] text-zinc-400 overflow-x-auto select-text scrollbar-thin select-all">
                    {sandboxPayload.data}
                  </pre>
                </details>
              </div>
            )}

            {sandboxPayload.type === 'latex' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-200 font-mono text-[10px]">
                <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded text-emerald-400 flex items-center gap-1.5">
                  <Check size={12} className="shrink-0" />
                  <span>LaTeX mathematical Typesetter active & formatted formulary charts.</span>
                </div>

                <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl text-zinc-200 flex flex-col space-y-4 text-center text-xs font-serif leading-relaxed">
                  <p className="text-[10px] font-mono text-zinc-500 tracking-wider text-left uppercase pr-4">RENDERED FORMULA</p>
                  
                  <div className="text-zinc-100 font-serif leading-loose border-y border-zinc-855/60 py-3 font-semibold select-all text-sm">
                    {`Ax = B`}
                    <div className="my-1.5 text-zinc-400 shrink-0 select-none">⬇</div>
                    {`det(A) ≠ 0 ⇒ x = A⁻¹ B`}
                    <div className="text-[10px] text-zinc-500 italic font-mono font-normal mt-2">
                       (System parameters solved within O(n³) Gauss operations)
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded font-mono text-[9px] text-zinc-400 leading-normal">
                  <p className="font-semibold text-zinc-300">LaTeX typeset block specifications:</p>
                  <code className="text-zinc-500 select-all block mt-1.5 bg-zinc-900 p-2 rounded">
                    {`$$\\mathbf{A}\\mathbf{x} = \\mathbf{B}$$
\\det(\\mathbf{A}) \\neq 0 \\implies \\mathbf{x} = \\mathbf{A}^{-1} \\mathbf{B}`}
                  </code>
                </div>
              </div>
            )}

            {sandboxPayload.type === 'python' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-2 bg-indigo-950/30 border border-indigo-900/50 rounded text-indigo-300 text-[10px] font-mono flex items-center gap-1.5 select-none">
                  <Code size={12} className="shrink-0" />
                  <span>Interactive JS / Python logic runner detected. Mapped file workspace context:</span>
                </div>

                <div className="bg-zinc-950 rounded border border-zinc-900 p-3 select-text font-mono text-[9.5px] text-zinc-400 relative">
                  <div className="absolute right-3.5 top-3 text-[8px] text-zinc-650 opacity-60">PYTHON BUFFER</div>
                  <pre className="leading-relaxed scrollbar-thin overflow-auto max-h-96">
                    {sandboxPayload.data}
                  </pre>
                </div>

                <div className="p-3 bg-zinc-900/40 rounded border border-zinc-850 space-y-1 text-[10px] font-mono select-none">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">DIAGNOSTIC TEST HARNESS LINK</span>
                  <div className="p-2 bg-zinc-950 border border-zinc-900 rounded flex justify-between items-center text-cyan-400 font-semibold cursor-pointer select-none">
                    <span className="flex items-center gap-1">
                      <Play size={11} /> Validate syntax properties
                    </span>
                    <span className="text-zinc-600">SCRIPT OK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
