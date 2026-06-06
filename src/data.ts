import { LLMProvider, PromptPreset, MCPConfig, SkillPlugin, VirtualFile, Session } from './types';

export const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'local',
    baseUrl: 'http://localhost:11434',
    isActive: true,
    models: ['llama3.1:8b', 'gemma2:9b', 'mistral:latest', 'phi3:latest', 'codellama:latest'],
    selectedModel: 'llama3.1:8b'
  },
  {
    id: 'lm_studio',
    name: 'LM Studio (Local)',
    type: 'local',
    baseUrl: 'http://localhost:1234/v1',
    isActive: false,
    models: ['meta-llama-3-8b-instruct', 'qwen2.5-7b-instruct', 'deepseek-coder-6.7b'],
    selectedModel: 'meta-llama-3-8b-instruct'
  },
  {
    id: 'openai',
    name: 'OpenAI (Remote)',
    type: 'remote',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    isActive: false,
    models: ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'gpt-4-turbo'],
    selectedModel: 'gpt-4o'
  },
  {
    id: 'google',
    name: 'Google Gemini (Remote)',
    type: 'remote',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: '',
    isActive: false,
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'],
    selectedModel: 'gemini-2.5-flash'
  },
  {
    id: 'simulator',
    name: 'Built-in Agent Simulator',
    type: 'custom',
    baseUrl: 'internal://sandbox',
    isActive: false,
    models: ['agent-v1-pro', 'agent-v1-code', 'agent-v1-creative'],
    selectedModel: 'agent-v1-pro'
  }
];

export const DEFAULT_PROMPTS: PromptPreset[] = [
  {
    id: 'general_assistant',
    name: 'Sleek System Operator',
    description: 'A sharp, concise technical companion responding with minimal fluff and max impact.',
    promptContent: 'You are Agent, an elite AI terminal assistant. Deliver ultra-clean response formats. When code is requested, present complete, syntactically bulletproof examples. Prioritize performance, modern syntax, and clear explanation of core trade-offs.',
    category: 'General'
  },
  {
    id: 'technical_architect',
    name: 'Technical Architect',
    description: 'Designs enterprise structures, class hierarchies, and database schemas.',
    promptContent: 'You are an outstanding Systems Architect. When users outline requirements, detail the modular architecture, database schemas (specifically PostgreSQL or Prisma layouts), endpoint structures, API security practices, and performance profiles. Provide beautiful diagram representations using ASCII or Mermaid.',
    category: 'Coding'
  },
  {
    id: 'mcp_prompter',
    name: 'MCP Orchestrator',
    description: 'Guides LLMs on how to consume connected tools, schemas, and local systems.',
    promptContent: 'You are an AI operating in a multi-tool workspace powered by Model Context Protocol (MCP). For every action, explain which files you are listing, reading, or active APIs you are querying. Ensure tool invocations are explicitly documented inside your reasoning pattern.',
    category: 'Analysis'
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter & Debugger',
    description: 'Expert inspector specialized in hunt-and-destroy bugs across react, rust, typescript, and python.',
    promptContent: 'You are an expert debugger. Analyze the provided logs, stack traces, or code snippets. Step-by-step trace potential memory leaks, race conditions, type misalignments, or edge-case input crashes. Output a structured plan: Root Cause, Proposed Fix, Defensive Code Patterns.',
    category: 'Debugging'
  },
  {
    id: 'ui_craftsman',
    name: 'UI Crafting Specialist',
    description: 'Styles beautiful React/Tailwind elements with precise UX rhythms.',
    promptContent: 'You are a master UI/UX web craftsman. Focus on Tailwind CSS, responsive designs, eye-safe colors, high typographic contrast, transitions, and hover-state logic. Always include layout code embedded inside standard React structure.',
    category: 'Creative'
  }
];

export const DEFAULT_MCPS: MCPConfig[] = [
  {
    id: 'mcp_filesystem',
    name: 'Local Filesystem MCP',
    url: 'http://localhost:3011',
    status: 'connected',
    description: 'Provides deep read/write and folder cataloging capabilities over the local workspace container.',
    isEnabled: true,
    tools: [
      {
        name: 'read_filesystem_file',
        description: 'Read the contents of a text file in the local file system.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Relative path of the target file' }
          },
          required: ['path']
        },
        isEnabled: true
      },
      {
        name: 'write_filesystem_file',
        description: 'Create or overwrite files with textual payloads.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Relative path where file will be written' },
            content: { type: 'string', description: 'The raw text content of the file' }
          },
          required: ['path', 'content']
        },
        isEnabled: true
      },
      {
        name: 'list_filesystem_dir',
        description: 'Enumerate directories and sub-folders in designated paths.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Root directory query' }
          }
        },
        isEnabled: true
      }
    ]
  },
  {
    id: 'mcp_web_browser',
    name: 'Brave Web MCP Search',
    url: 'http://localhost:3012',
    status: 'connected',
    description: 'Provides live access to Google & Brave search indexes and document screen-scraping endpoints.',
    isEnabled: true,
    tools: [
      {
        name: 'query_web_search',
        description: 'Query live search indexes to extract technical tutorials, current news, or doc pages.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search keywords' }
          },
          required: ['query']
        },
        isEnabled: true
      },
      {
        name: 'scrape_documentation',
        description: 'Extract raw text markup or markdown from a live URL.',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Full web page URL to parse' }
          },
          required: ['url']
        },
        isEnabled: true
      }
    ]
  },
  {
    id: 'mcp_vector_memory',
    name: 'Semantic Memory MCP',
    url: 'http://localhost:3013',
    status: 'offline',
    description: 'Embeds facts, user preferences, and documents into a local vector-store DB.',
    isEnabled: false,
    tools: [
      {
        name: 'memorize_fact',
        description: 'Store a semantic fact inside vector memory coordinates.',
        inputSchema: {
          type: 'object',
          properties: {
            fact: { type: 'string', description: 'Data item or user instruction' }
          },
          required: ['fact']
        },
        isEnabled: true
      },
      {
        name: 'query_memory',
        description: 'Lookup semantic correlations in the stored memories.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        },
        isEnabled: true
      }
    ]
  }
];

export const DEFAULT_SKILLS: SkillPlugin[] = [
  {
    id: 'plugin_svg_canvas',
    name: 'Visual SVG Sandbox',
    description: 'Instantly renders complex vector drawings and UI controls inside a reactive view canvas.',
    isEnabled: true,
    icon: 'Layers',
    category: 'Graphics'
  },
  {
    id: 'plugin_calculator',
    name: 'Expression Parser & Matrix Plotter',
    description: 'Solves complex array computations, matrix dot-products, and plots mathematical functions.',
    isEnabled: true,
    icon: 'Code',
    category: 'Math'
  },
  {
    id: 'plugin_js_runner',
    name: 'JS / Code Playground',
    description: 'Executes lightweight client-side scripts safely within a secure iframe runtime.',
    isEnabled: false,
    icon: 'SquareTerminal',
    category: 'Utility'
  },
  {
    id: 'plugin_latex',
    name: 'LaTeX Mathematical Typesetter',
    description: 'Automatically intercepts mathematical formulas and formats equations in pristine crisp typography.',
    isEnabled: true,
    icon: 'FileText',
    category: 'Data'
  }
];

export const INITIAL_FILES: VirtualFile[] = [
  {
    id: 'f1',
    name: 'README.md',
    path: '/README.md',
    content: `# 🤖 Welcome to Agent Workspace

This represents the absolute front-end command-center for Local LLMs (Ollama, LM Studio) and remote secure cloud endpoints (Google Gemini, OpenAI).

## 🚀 Key Workspaces

1. **System Prompt Studio**: Customize prompts, load pre-built workflows for coding, debugging, and UI design.
2. **Model Context Protocol (MCP)**: Directly link tools such as \`Local Filesystem MCP\` and \`Brave Web Search\` to let your models interact with your machine.
3. **Sandbox Plug-ins**: Activate skills inside your session to render vectors, run code simulations, or solve equations.
4. **Cloud Sync Cluster**: Securely back up workspace states, prompt libraries, and histories using 256-bit passphrase encryption keys.

## 🛠️ Testing Local Ollama CORS
By default, browser applications cannot access local processes without CORS headers allowed. Run Ollama with:
\`\`\`bash
OLLAMA_ORIGINS="*" ollama start
\`\`\`
`,
    size: 912,
    type: 'text/markdown',
    isDir: false
  },
  {
    id: 'f2',
    name: 'workspace_config.json',
    path: '/config/workspace_config.json',
    content: `{
  "agent_name": "Agent Desktop Terminal",
  "version": "1.2.0",
  "theme": "nebula-dark",
  "mcp_timeout_ms": 3000,
  "system_drivers": {
    "local_ollama": true,
    "lm_studio": false,
    "gemini_telemetry": false
  },
  "default_max_tokens": 4096
}`,
    size: 247,
    type: 'application/json',
    isDir: false
  },
  {
    id: 'f3',
    name: 'config',
    path: '/config',
    content: '',
    size: 0,
    type: 'directory',
    isDir: true
  },
  {
    id: 'f4',
    name: 'scripts',
    path: '/scripts',
    content: '',
    size: 0,
    type: 'directory',
    isDir: true
  },
  {
    id: 'f5',
    name: 'math_matrix_solver.py',
    path: '/scripts/math_matrix_solver.py',
    content: `import numpy as np

def solve_matrix_relation(coefficient_matrix, constant_vector):
    """
    Solves linear equation of form: Ax = B
    """
    A = np.array(coefficient_matrix)
    B = np.array(constant_vector)
    try:
        solution = np.linalg.solve(A, B)
        return {"status": "success", "vector": solution.tolist()}
    except np.linalg.LinAlgError as e:
        return {"status": "error", "message": f"Singular matrix: {str(e)}"}
`,
    size: 384,
    type: 'text/x-python',
    isDir: false
  }
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 's1',
    uid: 'mock_uid_1',
    title: 'Code Refactoring Session',
    systemPromptId: 'general_assistant',
    modelId: 'llama3.1:8b',
    providerId: 'ollama',
    temperature: 0.2,
    maxTokens: 2048,
    messages: [
      {
        id: 'm1',
        role: 'system',
        content: 'You are Agent, an elite AI terminal assistant.',
        timestamp: '10:14:22'
      },
      {
        id: 'm2',
        role: 'user',
        content: 'Hello! I need assistance configuring my workspace parameters.',
        timestamp: '10:14:45'
      },
      {
        id: 'm3',
        role: 'assistant',
        content: 'Hello, Workspace Manager. I am fully integrated into your Local LLM network and local filesystem driver. I detected MCP tool chains for File management and Search active. How can I facilitate your developer pipeline today?',
        timestamp: '10:15:02'
      }
    ],
    createdAt: '2026-06-06T10:14:00Z'
  },
  {
    id: 's2',
    uid: 'mock_uid_1',
    title: 'MCP Core Integrations Debugging',
    systemPromptId: 'mcp_prompter',
    modelId: 'gpt-4o',
    providerId: 'openai',
    temperature: 0.5,
    maxTokens: 4096,
    messages: [
      {
        id: 'm4',
        role: 'user',
        content: 'Show me how you execute commands across my local filesystem when I request a specific markdown file read.',
        timestamp: '11:20:00'
      },
      {
        id: 'm5',
        role: 'assistant',
        content: 'To execute a file read, I issue an MCP handshake to `Local Filesystem MCP` (hosted at `http://localhost:3011`).\n\nI will dispatch a message with JSON payload:\n```json\n{\n  "method": "tools/call",\n  "params": {\n    "name": "read_filesystem_file",\n    "arguments": {\n      "path": "/README.md"\n    }\n  }\n}\n```\nUpon receiving the string return, I format it and include the context directly into my context window schema.',
        timestamp: '11:20:25'
      }
    ],
    createdAt: '2026-06-06T11:19:00Z'
  }
];
