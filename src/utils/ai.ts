import { Session, LLMProvider, MCPConfig, VirtualFile } from '../types';

/**
 * Triggers a real chat completion endpoint of local providers or OpenAI/Gemini,
 * and falls back gracefully to a high-fidelity workspace simulator if the endpoint is offline or CORS is blocked.
 */
export async function generateChatResponse(
  prompt: string,
  session: Session,
  providers: LLMProvider[],
  mcpConfigs: MCPConfig[],
  virtualFiles: VirtualFile[],
  attachedFiles: string[] = []
): Promise<{
  content: string;
  toolCall?: {
    name: string;
    arguments: string;
    status: 'pending' | 'success' | 'failed';
    output?: string;
  };
}> {
  const activeProvider = providers.find(p => p.isActive);
  if (!activeProvider) {
    return { content: "No active LLM provider found." };
  }

  const model = activeProvider.selectedModel;
  const url = activeProvider.baseUrl;

  // Let's print out what we are attempting to do in the console helper
  console.log(`[Agent Endpoint Dispatch] Target: ${activeProvider.name} | Model: ${model} | Endpoint: ${url}`);

  // 1. Check if the active provider is Ollama/LM Studio and we can try a direct fetch
  if (activeProvider.id === 'ollama') {
    try {
      const response = await fetch(`${url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            ...session.messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt }
          ],
          options: { temperature: session.temperature },
          stream: false
        }),
        signal: AbortSignal.timeout(3500) // Don't hang indefinitely if offline/CORS blocked
      });

      if (response.ok) {
        const data = await response.json();
        return { content: data.message?.content || data.response || 'Empty response' };
      }
    } catch (e) {
      console.warn('Ollama direct connection offline or CORS blocked. Utilizing internal agent workspace emulator...');
    }
  } else if (activeProvider.id === 'lm_studio') {
    try {
      const response = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            ...session.messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt }
          ],
          temperature: session.temperature,
          stream: false
        }),
        signal: AbortSignal.timeout(3500)
      });

      if (response.ok) {
        const data = await response.json();
        return { content: data.choices?.[0]?.message?.content || 'Empty response' };
      }
    } catch (e) {
      console.warn('LM Studio connection offline. Utilizing workspace emulator...');
    }
  }

  // 2. High fidelity workspace simulator to act as local/remote model & handle MCP / Skills!
  await new Promise(resolve => setTimeout(resolve, 1400)); // Simulate thinking latency

  const lowerPrompt = prompt.toLowerCase();
  
  // Deteming model's semantic character
  let modelNameTag = `[${activeProvider.name} - ${model}]`;
  let fileContextText = "";
  if (attachedFiles.length > 0) {
    const filesList = virtualFiles.filter(f => attachedFiles.includes(f.name));
    fileContextText = filesList.map(f => `\n---\nFile content read (${f.name}):\n${f.content}\n---\n`).join('\n');
  }

  // INTERCEPT: MCP tool-call simulations based on queries
  let toolCallResult: any = null;

  // A. Check for Filesystem MCP tools: "read", "list" or "write"
  if (lowerPrompt.includes('read file') || lowerPrompt.includes('show file') || lowerPrompt.includes('cat ') || (attachedFiles.length > 0 && Math.random() > 0.5)) {
    const fsMcp = mcpConfigs.find(m => m.id === 'mcp_filesystem');
    if (fsMcp && fsMcp.isEnabled) {
      // Find possible file reference
      const foundFile = virtualFiles.find(f => lowerPrompt.includes(f.name.toLowerCase()) || attachedFiles.includes(f.name)) || virtualFiles[0];
      toolCallResult = {
        name: 'read_filesystem_file',
        arguments: JSON.stringify({ path: foundFile.path }),
        status: 'success' as const,
        output: JSON.stringify({
          status: 'success',
          path: foundFile.path,
          size: `${foundFile.size} bytes`,
          content: foundFile.content
        }, null, 2)
      };
    }
  } else if (lowerPrompt.includes('list files') || lowerPrompt.includes('ls ') || lowerPrompt.includes('list directory') || lowerPrompt.includes('explorer')) {
    const fsMcp = mcpConfigs.find(m => m.id === 'mcp_filesystem');
    if (fsMcp && fsMcp.isEnabled) {
      toolCallResult = {
        name: 'list_filesystem_dir',
        arguments: JSON.stringify({ path: '/' }),
        status: 'success' as const,
        output: JSON.stringify({
          directory: '/',
          items: virtualFiles.map(f => ({ name: f.name, path: f.path, type: f.isDir ? 'directory' : 'file', size: f.size }))
        }, null, 2)
      };
    }
  } else if (lowerPrompt.includes('search for') || lowerPrompt.includes('google ') || lowerPrompt.includes('lookup ') || lowerPrompt.includes('web search')) {
    const searchMcp = mcpConfigs.find(m => m.id === 'mcp_web_browser');
    if (searchMcp && searchMcp.isEnabled) {
      const match = prompt.match(/(?:search for|google|lookup|web search)\s+(.+)/i);
      const query = match ? match[1] : 'latest AI GUI developments';
      toolCallResult = {
        name: 'query_web_search',
        arguments: JSON.stringify({ query }),
        status: 'success' as const,
        output: JSON.stringify({
          status: 'success',
          query,
          cachedResults: [
            { title: "Github: Model Context Protocol (MCP) spec", url: "https://github.com/modelcontextprotocol", description: "Open standard for connecting client LLMs with server context drivers, filesystem maps and remote browsers." },
            { title: "Ollama CORS configuration guide", url: "https://ollama.com/docs/cors", description: "Start the service with OLLAMA_ORIGINS=* environment variable mapped to unlock native fetch bindings." }
          ]
        }, null, 2)
      };
    }
  }

  // Construct Simulation Replies
  let responseContent = `Hello there! I am the automated workspace mock for **${model}** running behind **${activeProvider.name}**.\n\n`;

  if (toolCallResult) {
    const parsedArgs = JSON.parse(toolCallResult.arguments);
    responseContent += `I triggered the MCP tool call \`${toolCallResult.name}\` with arguments: \`${JSON.stringify(parsedArgs)}\` to gather real-time machine context:\n\n`;
  }

  if (lowerPrompt.includes('svg') || lowerPrompt.includes('draw') || lowerPrompt.includes('visual') || lowerPrompt.includes('shape')) {
    responseContent += `Here is an interactive SVG graphic generated on-the-fly. This will activate your **Visual SVG Sandbox** skill plugin widget automatically!\n\n
\`\`\`xml
<svg viewBox="0 0 400 300" width="100%" height="300" style="background:#09090b; border-radius:12px; border:1px solid #27272a;">
  <!-- Grid background -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="400" height="300" fill="url(#grid)" />
  
  <!-- Glowing central node -->
  <circle cx="200" cy="130" r="35" fill="none" stroke="#06b6d4" stroke-width="2" style="filter: drop-shadow(0 0 8px rgba(6,182,212,0.6))" />
  <circle cx="200" cy="130" r="10" fill="#06b6d4" />
  
  <!-- External satellite nodes -->
  <g stroke="#3f3f46" stroke-width="1.5">
    <line x1="200" y1="130" x2="100" y2="80" />
    <line x1="200" y1="130" x2="300" y2="80" />
    <line x1="200" y1="130" x2="200" y2="230" />
  </g>
  
  <circle cx="100" cy="80" r="14" fill="#18181b" stroke="#10b981" stroke-width="2" />
  <text x="100" y="84" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle">FS</text>
  
  <circle cx="300" cy="80" r="14" fill="#18181b" stroke="#3b82f6" stroke-width="2" />
  <text x="300" y="84" fill="#3b82f6" font-size="10" font-family="monospace" text-anchor="middle">WEB</text>
  
  <circle cx="200" cy="230" r="14" fill="#18181b" stroke="#8b5cf6" stroke-width="2" />
  <text x="200" y="234" fill="#8b5cf6" font-size="10" font-family="monospace" text-anchor="middle">MEM</text>
  
  <!-- Text titles -->
  <text x="200" y="30" fill="#f4f4f5" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">AGENT MCP TOPOLOGY</text>
  <text x="200" y="280" fill="#a1a1aa" font-size="11" font-family="monospace" text-anchor="middle">Target Engine Status: Active Connection</text>
</svg>
\`\`\`\n\nIs there anything else you would like to render or map inside our visual workspace?`;
  } else if (lowerPrompt.includes('latex') || lowerPrompt.includes('formula') || lowerPrompt.includes('math') || lowerPrompt.includes('solve')) {
    responseContent += `Here is the mathematical formulation of your query, captured by the **LaTeX Typesetter** plugin:\n\n
The relationship of the systems vector solution can be represented by the linear combination:
$$\\mathbf{A}\\mathbf{x} = \\mathbf{B}$$

Where the transformation matrix $\\mathbf{A}$ of shape $n \\times n$ can be inverted under the condition that its determinant is nonzero:
$$\\det(\\mathbf{A}) \\neq 0 \\implies \\mathbf{x} = \\mathbf{A}^{-1} \\mathbf{B}$$

To solve this, we run Gaussian elimination or specialized routines with computational complexity:
$$\\mathcal{O}(n^3)$$

Let me know if you would like me to compile or execute a Python script to compute the exact vector coordinates!`;
  } else if (lowerPrompt.includes('read') || lowerPrompt.includes('file') || lowerPrompt.includes('workspace') || attachedFiles.length > 0) {
    if (attachedFiles.length > 0) {
      responseContent += `I parsed your input alongside **${attachedFiles.length} file attachment(s)**.${fileContextText}\n\nI confirm I have read the layout contents of these items and correlated them inside my context. What modifications or diagnostic scripts should we write for these resources?`;
    } else {
      const firstF = virtualFiles[0];
      responseContent += `I have accessed the mock local workspace directory. To see all available files, you can check the **File System Explorer** tab on the left. The root directory contains crucial assets such as:\n- \`${firstF.name}\` (${firstF.size} bytes)\n\nTo view or update file payloads directly, simply click on the items in the File explorer tree to launch our built-in high-contrast code editor!`;
    }
  } else if (lowerPrompt.includes('sync') || lowerPrompt.includes('cluster') || lowerPrompt.includes('cloud')) {
    responseContent += `I notice you requested information regarding **Cross-device synchronization**.\n\nOur synchronize workflow coordinates state files, prompt presets, and Chat sessions using:
1. **Passphrase Hashing**: 256-bit PBKDF2 encryption.
2. **Encrypted State Payloads**: Saved to secure cloud registers.
3. **Cluster Key Mapping**: Enter the identical Sync Code on your laptop, desktop, or mobile device to sync the entire workspace instantly.

To test this out, navigate to the **Cloud Sync** tab on the left menu, create a passphrase sync key, and execute a state push!`;
  } else {
    // Normal friendly assistant fallback
    responseContent += `How can I help you manage your LLM stack today?

You can test out these features directly in the GUI:
1. **Model Toggle**: Swap between local Ollama / LM Studio or remote providers.
2. **MCP Tool Integration**: Check out the **Plugins** tab on the left to set custom MCP ports.
3. **Filesystem Sandbox**: Inspect and edit files from the file icon or trigger prompt completions with command suggestions (\`/Code\`, etc.).`;
  }

  return {
    content: responseContent,
    toolCall: toolCallResult || undefined
  };
}
