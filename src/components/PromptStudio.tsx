import React, { useState } from 'react';
import { PromptPreset } from '../types';
import { Plus, Trash2, Edit2, Play, Sparkles, AlertCircle, Bookmark, Check } from 'lucide-react';

interface PromptStudioProps {
  prompts: PromptPreset[];
  activePromptId: string;
  onSelectPrompt: (promptId: string) => void;
  onAddPrompt: (prompt: PromptPreset) => void;
  onDeletePrompt: (promptId: string) => void;
}

export default function PromptStudio({
  prompts,
  activePromptId,
  onSelectPrompt,
  onAddPrompt,
  onDeletePrompt
}: PromptStudioProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(activePromptId);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'Coding' | 'Debugging' | 'Creative' | 'Analysis'>('General');

  const selectedPreset = prompts.find(p => p.id === selectedPresetId) || prompts[0];

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPrompt: PromptPreset = {
      id: 'custom_' + Date.now(),
      name: title,
      description: desc || 'Custom defined agent system behavior.',
      promptContent: content,
      category,
      isCustom: true
    };

    onAddPrompt(newPrompt);
    setSelectedPresetId(newPrompt.id);
    setIsCreating(false);

    // Reset fields
    setTitle('');
    setDesc('');
    setContent('');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-100 font-mono flex items-center gap-1.5">
            <Sparkles size={13} className="text-cyan-400" />
            Prompt Studio
          </h2>
          <p className="text-[10px] text-zinc-500 leading-normal">System instructions & conversational overlays</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[10px] rounded hover:text-cyan-400 font-semibold uppercase tracking-wider font-mono transition-transform active:scale-95"
          >
            <Plus size={11} />
            New
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleCreatePrompt} className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">CREATING BEHAVIOR PATTERN</span>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">Prompt Title</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Code Refactoring Bot"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">Short Description</label>
            <input 
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Enforces strict clean code constraints..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
              >
                <option value="General">General</option>
                <option value="Coding">Coding</option>
                <option value="Debugging">Debugging</option>
                <option value="Creative">Creative</option>
                <option value="Analysis">Analysis</option>
              </select>
            </div>
            <div className="flex items-end text-[9px] text-zinc-500 pb-2 italic leading-tight">
              Classified prompts populate matching quick autocomplete models in the Chat feed.
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">System prompt template content</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="You are Agent, an elite coding specialist..."
              className="w-full h-44 bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2 bg-gradient-to-r from-cyan-900 to-indigo-900 hover:from-cyan-800 hover:to-indigo-800 text-white font-mono uppercase tracking-wider text-xs font-semibold rounded shadow transition-all active:scale-95"
          >
            Deploy Prompt Blueprint
          </button>
        </form>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Preset Chips Selector side */}
          <div className="p-3 border-b border-zinc-900 flex flex-col gap-1.5 shrink-0">
            <span className="text-[8px] font-bold text-zinc-600 tracking-widest font-mono uppercase">TEMPLATES (LIBRARIES)</span>
            <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
              {prompts.map(p => {
                const isActiveSel = p.id === selectedPresetId;
                const isActivatedInWorkspace = p.id === activePromptId;
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPresetId(p.id)}
                    className={`p-2 rounded cursor-pointer border transition-all flex items-center justify-between ${
                      isActiveSel 
                        ? 'bg-zinc-900 border-zinc-700 text-cyan-400' 
                        : 'bg-zinc-950 hover:bg-zinc-900/60 border-zinc-900/50 text-zinc-400'
                    }`}
                  >
                    <div className="truncate flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-medium truncate leading-none">{p.name}</span>
                        <span className="text-[7.5px] px-1 py-[1px] bg-zinc-800 text-zinc-400 rounded font-mono capitalize">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-500 truncate mt-0.5 font-sans leading-none">{p.description}</p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {isActivatedInWorkspace && (
                        <span className="w-4 h-4 bg-emerald-950 border border-emerald-800 rounded flex items-center justify-center text-emerald-400" title="Active on-stream">
                          <Check size={8} />
                        </span>
                      )}
                      {p.isCustom && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePrompt(p.id);
                            if (selectedPresetId === p.id) {
                              setSelectedPresetId(prompts[0].id);
                            }
                          }}
                          className="p-1 hover:bg-rose-950 text-zinc-600 hover:text-rose-400 rounded transition-colors"
                          title="Purge custom behavioral blueprint"
                        >
                          <Trash2 size={9} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Preset Detail Content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between scrollbar-thin">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="flex items-center space-x-1.5 text-zinc-200">
                  <Bookmark size={14} className="text-cyan-400" />
                  <span className="text-xs font-mono font-bold">{selectedPreset.name}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 text-zinc-400 font-mono rounded">
                  {selectedPreset.category} overlay
                </span>
              </div>

              <div>
                <p className="text-[10px] text-zinc-400 font-sans tracking-wide leading-relaxed">
                  {selectedPreset.description}
                </p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded font-mono text-zinc-400 text-[10.5px] max-h-56 overflow-y-auto leading-relaxed scrollbar-thin whitespace-pre-wrap">
                {selectedPreset.promptContent}
              </div>
            </div>

            {/* Bottom Activation controller */}
            <div className="pt-4 mt-auto">
              {activePromptId === selectedPreset.id ? (
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/50 rounded flex items-center gap-2 text-emerald-400 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="font-mono scale-95 origin-left">This behavioral overlay is currently live and active in your active conversation loop!</span>
                </div>
              ) : (
                <button 
                  onClick={() => onSelectPrompt(selectedPreset.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-violet-950 hover:from-cyan-900 to-indigo-950 hover:to-indigo-900 border border-violet-800 hover:border-cyan-700 text-white font-mono uppercase tracking-wider text-[11px] font-bold rounded transition-colors"
                >
                  <Play size={11} className="animate-pulse" />
                  Inject behavior into active session
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
