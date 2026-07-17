# ChatDPT Agent

A personal AI assistant built with LangChain and LangGraph, featuring both a web UI and a CLI interface. The agent uses tools like web search (Tavily) and a mock calendar events tool to answer queries, with streaming responses rendered in a React chat interface.

## Tech Stack

| Layer        | Technologies |
|-------------|-------------|
| **Backend** | Node.js, Express 5, LangChain, LangGraph, Groq (LLM), Tavily (web search), Zod |
| **Frontend**| React 19, Vite 8, TypeScript 6, react-markdown |
| **Runtime** | Node.js (ES modules), pnpm |

The project also includes an agent skill library (under `.agents/skills/`) sourced from [mattpocock/skills](https://github.com/mattpocock/skills) — reusable agent definitions for code review, debugging, TDD, domain modeling, and more.

## Project Structure

```
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx           # Chat UI component
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Styles
│   ├── index.html
│   ├── vite.config.js        # Vite config (proxies /api to :3001)
│   └── package.json
│
├── server/                    # Express backend
│   ├── index.js              # Express server (port 3001) — /api/chat, /api/health
│   ├── agent.js              # Core agent — LLM, tools, LangGraph agent
│   ├── cli.js                # Interactive CLI agent
│   ├── graph-cli.js          # Custom LangGraph StateGraph demo
│   ├── biryani.js            # Biryani cooking state graph demo
│   └── utils.js              # Mermaid graph visualization utility
│
├── .agents/skills/            # Agent skill library (23 skills)
├── .env                       # API keys (GROQ_API_KEY, TAVILY_API_KEY)
├── package.json               # Root — server dependencies & scripts
└── pnpm-lock.yaml
```

## Setup

### Prerequisites

- **Node.js** >= 20
- **pnpm** — install via `npm install -g pnpm` or `brew install pnpm`

### 1. Install Dependencies

```bash
# Install server dependencies (root)
pnpm install

# Install client dependencies
cd client && pnpm install && cd ..
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
TAVILY_API_KEY=tvly-your_tavily_api_key_here
```

- **Groq API key**: [console.groq.com](https://console.groq.com/)
- **Tavily API key**: [app.tavily.com](https://app.tavily.com/)

### 3. Run the App

| Command | Description |
|---------|-------------|
| `pnpm dev` | Starts both the Express server (`:3001`) and Vite dev server (`:5173`) with HMR |
| `pnpm dev:server` | Starts only the backend |
| `pnpm dev:cli` | Runs the interactive CLI agent |
| `pnpm graph` | Runs the custom LangGraph CLI demo |
| `pnpm biryani` | Runs the biryani cooking state graph demo |

Open `http://localhost:5173` in your browser for the web UI.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send a message to the agent. Add `?stream=true` for SSE streaming. |
| `/api/health` | GET | Health check |

## Skills

The `.agents/skills/` directory contains reusable agent skill definitions including: code review, codebase design, diagnosing bugs, domain modeling, TDD, prototyping, research, triage, wayfinding, and more. These are sourced and version-locked via `skills-lock.json`.
