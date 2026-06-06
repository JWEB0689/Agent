export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  type: string; // e.g. 'text/plain', 'application/json', 'image/png'
  isDir: boolean;
  parentId?: string; // for hierarchical support
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachedFiles?: string[]; // file paths/names
  toolCall?: {
    name: string;
    arguments: string;
    status: 'pending' | 'success' | 'failed';
    output?: string;
  };
}

export interface Session {
  id: string;
  title: string;
  systemPromptId: string; // references custom-prompts
  modelId: string;
  providerId: string;
  temperature: number;
  maxTokens: number;
  messages: Message[];
  createdAt: string;
}

export type ProviderType = 'local' | 'remote' | 'custom';

export interface LLMProvider {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  models: string[];
  selectedModel: string;
}

export interface PromptPreset {
  id: string;
  name: string;
  description: string;
  promptContent: string;
  category: 'General' | 'Coding' | 'Debugging' | 'Creative' | 'Analysis';
  isCustom?: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  isEnabled: boolean;
}

export interface MCPConfig {
  id: string;
  name: string;
  url: string; // e.g. http://localhost:3010
  status: 'connected' | 'offline' | 'connecting';
  description: string;
  tools: MCPTool[];
  isEnabled: boolean;
}

export interface SkillPlugin {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  icon: string;
  category: 'Data' | 'Graphics' | 'Math' | 'Utility';
}

export interface SyncProfile {
  syncCode: string;
  passphrase?: string;
  lastSynced?: string;
  isConnected: boolean;
  logs: string[];
}
