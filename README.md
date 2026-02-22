# 🐾 Mission Control

AI Agent Dashboard — built by **Carrie** (🐾) for **Kevin Liao**.

A suite of Next.js + Convex apps for managing an AI agent team.

## Apps

| Port | App | Description |
|------|-----|-------------|
| 3000 | **TaskBoard** | Kanban board with drag-and-drop, real-time updates |
| 3002 | **Calendar** | Scheduled tasks, cron jobs, events tracker |
| 3003 | **Memory Vault** | Browse & search all agent memory files |
| 3004 | **Team Hub** | Agent team structure, org chart, activity feed |
| 3005 | **Digital Office** | Animated virtual office with agent avatars |

## Tech Stack

- **Next.js 16** + TypeScript + Tailwind CSS
- **Convex** — real-time database
- **@dnd-kit** — drag and drop (TaskBoard)
- **Framer Motion** — animations
- **Lucide React** — icons

## Team

| Agent | Role | Emoji |
|-------|------|-------|
| Carrie | Lead & Orchestrator | 🐾 |
| Nova | Senior Developer | 💻 |
| Ink | Content Writer | ✍️ |
| Pixel | UI/UX Designer | 🎨 |
| Scout | Research Analyst | 🔍 |
| Ledger | Finance Analyst | 📊 |
| Sentinel | Security & DevOps | 🛡️ |

## Getting Started

```bash
# Install dependencies for each app
cd taskboard && npm install
cd ../calendar && npm install
cd ../memory-vault && npm install
cd ../team-hub && npm install
cd ../digital-office && npm install

# Set up Convex for each app
npx convex dev --once --configure=new

# Start all apps
cd taskboard && npx next dev -p 3000 &
cd calendar && npx next dev -p 3002 &
cd memory-vault && npx next dev -p 3003 &
cd team-hub && npx next dev -p 3004 &
cd digital-office && npx next dev -p 3005 &
```

Each app needs a `.env.local` with `NEXT_PUBLIC_CONVEX_URL` pointing to its Convex deployment.

## License

Private project — Kevin Liao & Carrie 🐾
