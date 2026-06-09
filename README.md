<div align="center">
  <img src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" alt="Agent Banner" width="100%" />
  <h1>Agent Desktop</h1>
  <p><strong>Real-Time Knowledge & Local Intelligence Environment</strong></p>
  
  <p>
    <a href="https://github.com/JWEB0689/Agent/releases/latest"><img src="https://img.shields.io/github/v/release/JWEB0689/Agent?style=for-the-badge&color=cyan" alt="Release" /></a>
    <a href="https://github.com/JWEB0689/Agent/actions/workflows/release.yml"><img src="https://img.shields.io/github/actions/workflow/status/JWEB0689/Agent/release.yml?style=for-the-badge&color=indigo" alt="Build Status" /></a>
    <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-emerald?style=for-the-badge" alt="Platforms" />
  </p>
</div>

---

## Overview

**Agent** is a powerful, local-first AI development environment built as a desktop application using React, Vite, and Electron. 

It seamlessly bridges your local file system, local and cloud LLMs, and Model Context Protocol (MCP) tool integrations into a unified, secure workspace.

## ⚡ Features

- **Google Gemini Integrated:** Directly connects to `gemini-2.5-flash` natively, utilizing compressed conversational contexts for lightning-fast autonomous coding.
- **Local-First Execution:** Fall back to native local LLMs via CORS when offline, keeping your proprietary code entirely on-device.
- **Visual Sandboxing:** Dynamically compile interactive Javascript/Python scripts, render visual SVGs, and solve LaTeX matrices directly within the chat timeline.
- **File System Explorer:** Link virtual or real local files to your prompt context simply by typing `@`.
- **MCP Tool Integration:** Connect existing tools and pipelines via the Model Context Protocol (triggerable with `#`). *Includes the custom `sys-monitor` plugin for real-time hardware tracking.*
- **RTK Optimization Engine:** Agent utilizes the proprietary [RTK Engine](https://github.com/JWEB0689/rtk-engine) backend to aggressively compress token context windows via sliding-window heuristics, drastically lowering API costs during long sessions.

## 🚀 Installation & Downloads

The easiest way to get started is to download the compiled executable for your operating system:

**[👉 Download for Windows (.exe) & macOS (.dmg)](https://github.com/JWEB0689/Agent/releases/latest)**

*(Note: On macOS, you may need to right-click and select "Open" the first time due to the lack of a paid Apple Developer certificate).*

## 🛠️ Development Setup

If you want to build Agent from source or contribute to the project:

### Prerequisites
- Node.js (v20+)
- Git

### Build Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JWEB0689/Agent.git
   cd Agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run electron:dev
   ```

### Packaging for Release

To package the application into a standalone installer:
- **Windows:** `npm run electron:build:win`
- **macOS:** `npm run electron:build:mac`

*(Alternatively, just push a tag like `v1.x.x` to trigger the automated GitHub Actions pipeline).*

## 🔒 Security

Agent is packaged with `nodeIntegration: false` and `contextIsolation: true` to ensure the renderer process cannot execute malicious code natively on your system. Always verify the source of MCP plugins before enabling them.

---
<div align="center">
  <p><i>Autonomous Intelligence. Built for Engineers.</i></p>
</div>
