# APIverse

A comprehensive, full-stack web application designed to be the intelligence layer for the API economy. APIverse lets developers discover, test, monitor, and compose APIs — all powered by AI.

The platform offers AI-driven API discovery, real-time health monitoring, an interactive playground, a drag-and-drop pipeline composer, and a live community feed — all under one roof.

---

## Technologies Used

### Frontend
- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Custom CSS Modules, CSS Variables (Warm Graphite dark theme)
- **Fonts:** Inter, JetBrains Mono (Google Fonts)
- **Animations:** Framer Motion (drag-and-drop canvas)
- **Icons:** Lucide React, inline SVGs
- **Auth UI:** NextAuth v5 (credentials, GitHub OAuth, Google OAuth)

### Backend
- **Framework:** Next.js API Routes (App Router)
- **Database / ORM:** Supabase (PostgreSQL) + Prisma ORM
- **Authentication:** NextAuth v5 — JWT strategy, 24h session expiry
- **AI Integration:** Google Gemini, Groq SDK, Ollama (local models)
- **Caching:** Redis (Upstash)
- **File Handling:** Multer (via API routes)

---

## Running the Project Locally

### Prerequisites
- Node.js 18+ installed
- A Supabase project (for database + user storage)
- API keys for Google Gemini and Groq (for AI features)
- Redis instance — Upstash recommended (free tier works)
- Optional: Ollama installed locally for offline AI models

### 1. Clone the repository
```bash
git clone https://github.com/Alok1725/APIverse.git
cd APIverse
```

### 2. Environment Variables Setup
Create a `.env.local` file in the project root. **Never commit this file.**

```env
# Database
DATABASE_URL=your_supabase_postgres_connection_string

# NextAuth
AUTH_SECRET=your_random_secret_string   # generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional — leave blank to disable)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# AI Providers
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Redis
REDIS_URL=your_upstash_redis_url
REDIS_TOKEN=your_upstash_redis_token
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up the Database
```bash
npx prisma generate
npx prisma db push
```

Optionally seed the database with sample API data:
```bash
node prisma/seed.js
```

### 5. Run the Development Server
```bash
npm run dev --webpack
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Key Features

- **Discover** — Search and explore a curated catalog of APIs with AI-powered descriptions, ratings, and reviews.
- **Observatory** — Real-time health monitoring dashboard showing uptime, latency, and incident history for popular APIs.
- **Playground** — Interactive API request builder. Set headers, body, method, and fire live requests — powered by AI completion.
- **Compose** — Drag-and-drop pipeline canvas to chain multiple APIs into a workflow. Reorder steps, add from a palette, and generate with AI.
- **Radar** — Live community feed of API changelogs, incidents, deprecations, and new releases — filterable by category.
- **Dashboard** — Personal workspace showing saved APIs, recent searches, and activity.
- **AI Assistant** — Gemini + Groq powered responses for API recommendations, schema explanations, and debugging help.
- **Auth** — Email/password signup + GitHub and Google OAuth. Sessions expire after 24 hours requiring a daily re-login.

---

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com):

1. Push to GitHub (already done).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add all environment variables from `.env.local` in **Settings → Environment Variables**.
4. Deploy — Vercel auto-detects Next.js and handles everything else.

> Make sure `DATABASE_URL` uses the **pooled** Supabase connection string for production (port `6543`, not `5432`).

---

## Project Structure

```
APIverse/
├── app/
│   ├── (auth)/          # Sign in / Sign up pages
│   ├── (main)/          # All main app pages (discover, playground, etc.)
│   ├── api/             # Next.js API routes (AI, auth, data)
│   ├── globals.css      # CSS variables + global styles
│   └── layout.jsx       # Root layout
├── components/
│   ├── layout/          # Navbar, Footer
│   └── ui/              # Shared UI components
├── lib/
│   ├── ai/              # AI gateway (Gemini, Groq, Ollama providers)
│   └── db.js            # Prisma client singleton
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Sample data seeder
├── public/              # Static assets + logo
├── auth.js              # NextAuth configuration
└── proxy.js             # Route protection middleware
```

---

## Author

Built by [Alok1725](https://github.com/Alok1725) · Follow on [X](https://x.com/Eren17Alok)
