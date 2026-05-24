# ReviewAI — AI-Powered Pull Request Review Assistant

> Catch security vulnerabilities, performance issues, and bugs before they reach production. Powered by Llama 3.3 70B via Groq.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API key → https://console.groq.com
- Firebase project → https://console.firebase.google.com
- GitHub Personal Access Token (optional, for private repos)

---

## 📦 Project Structure

```
reviewai/
├── backend/          # Node.js + Express + Prisma + SQLite
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── prisma/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── frontend/         # React + Vite + Tailwind CSS
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── contexts/
    │   ├── services/
    │   └── lib/
    └── package.json
```

---

## ⚙️ Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Fill in your values in .env

# 3. Initialize database
npx prisma generate
npx prisma db push

# 4. Start dev server
npm run dev
# Runs on http://localhost:5000
```

### Backend `.env` variables:
```
PORT=5000
DATABASE_URL="file:./dev.db"
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_github_personal_access_token
FIREBASE_PROJECT_ID=your_firebase_project_id
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🎨 Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Fill in your Firebase values

# 3. Start dev server
npm run dev
# Runs on http://localhost:5173
```

### Frontend `.env` variables:
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Google**
4. Add your domain to Authorized domains (`localhost` is added by default)
5. Go to Project Settings → Your apps → Web app → copy config values to `.env`

---

## 🤖 Groq API Setup

1. Go to [console.groq.com](https://console.groq.com)
2. Create an account and generate an API key
3. Add to `backend/.env` as `GROQ_API_KEY`
4. Users can also add their own key in Settings

---

## 🐙 GitHub Token Setup (Optional)

For private repo access and higher rate limits:
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select `repo` scope for private repos
4. Add to `backend/.env` as `GITHUB_TOKEN`

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
# Set environment variables in Vercel dashboard
```

### Backend (Railway / Render)
```bash
cd backend
# Push to GitHub
# Connect repo to Railway or Render
# Set environment variables in dashboard
# Add DATABASE_URL as Railway's Postgres or keep SQLite
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| UI Components | Lucide React, Recharts, React Syntax Highlighter |
| Routing | React Router DOM v6 |
| Auth | Firebase Authentication (Google OAuth) |
| Backend | Node.js, Express.js |
| Database | SQLite + Prisma ORM |
| AI Model | Llama 3.3 70B via Groq API |
| GitHub API | GitHub REST API v3 |
| HTTP Client | Axios |
| Notifications | React Hot Toast |

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync Firebase user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/reviews/analyze-pr` | Analyze GitHub PR |
| POST | `/api/reviews/analyze-code` | Analyze pasted code |
| GET | `/api/reviews` | List user's reviews |
| GET | `/api/reviews/:id` | Get review details |
| POST | `/api/reviews/:id/fix` | Generate AI fix |
| POST | `/api/reviews/security-scan` | Security-only scan |
| DELETE | `/api/reviews/:id` | Delete review |
| POST | `/api/chat/message` | Send chat message |
| GET | `/api/chat/history` | Get chat history |
| GET | `/api/analytics/dashboard` | Dashboard analytics |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |

---

## 🎯 Features

- **PR Analysis** — Paste any GitHub PR URL for instant AI review
- **Code Paste** — Analyze code snippets in 9+ languages
- **Security Scanner** — Detects hardcoded secrets, SQL injection, OWASP vulnerabilities
- **Performance Analysis** — Finds inefficient loops, N+1 queries, memory issues
- **Code Quality** — Code smells, naming issues, maintainability problems
- **AI Auto-Fix** — One-click AI-generated fixes for every issue
- **Merge Score** — Composite readiness score (security + quality + performance)
- **AI Chat** — Interactive assistant for code questions
- **Review History** — All past analyses saved and searchable
- **Dark Theme** — Polished dark UI inspired by Linear, Vercel, Cursor

---

## 📝 License

MIT License — Built for hackathons and production use.
