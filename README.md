# Local Ummah - Community Mutual Aid Platform

A mosque-centered mutual aid (sadaqa/charity) platform that connects community members who need help with those who can offer it.

## Features

- ✅ **Guest Mode** - Browse posts without signing up
- ✅ **Create Requests/Offers** - Post needs or offers to help
- ✅ **Contact Integration** - Direct SMS, Phone, or Email contact
- ✅ **Anonymous Posting** - Post without revealing your identity
- ✅ **Urgent Marking** - Highlight time-sensitive needs
- ✅ **Secure Auth** - bcrypt password hashing
- ✅ **Cross-Platform** - Works on Web, iOS, Android
- ✅ **Search** - Find posts by title or description
- ✅ **Modern UI** - Shimmer loaders, toast notifications, haptic feedback
- ✅ **Optimistic Updates** - Instant feedback on actions

## Tech Stack

- **Client**: Expo React Native with TanStack Query
- **Server**: Express.js with Drizzle ORM
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions with staging/production environments

## Quick Start (Development)

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Clone and Install
```bash
git clone <repo-url>
cd Community-Sadaqa
npm install
```

### 2. Start Database (Docker)
```bash
npm run docker:db
```

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Start Development Servers
```bash
# Terminal 1: API Server
npm run server:dev

# Terminal 2: Expo Web
npm run expo:local
```

Open http://localhost:8081 in your browser.

## Deploy to Production (Free)

### Option 1: Railway (Recommended - includes PostgreSQL)

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → Deploy from GitHub repo
3. **Add PostgreSQL**: Add a PostgreSQL service
4. **Set Environment Variables**:
   ```
   DATABASE_URL=<auto-filled by Railway>
   PORT=5000
   NODE_ENV=production
   ```
5. **Configure Build**:
   - Build Command: `npm ci && npm run server:build`
   - Start Command: `npm run server:prod`

### Option 2: Render + Neon

1. **Create Neon Database** (free): https://neon.tech
   - Create a project and copy the connection string

2. **Deploy to Render**: https://render.com
   - New → Web Service → Connect GitHub repo
   - Build Command: `npm ci && npm run server:build`
   - Start Command: `npm run server:prod`
   - Add Environment Variable: `DATABASE_URL=<neon-connection-string>`

### Option 3: Docker Self-Host

Build and run the full stack with Docker:

```bash
# Production build with app + database
docker compose up --build -d

# Check logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at http://localhost:5000

### Deploy Web Client

For Expo web, you can:

1. **Build static web assets**:
   ```bash
   npx expo export --platform web
   ```

2. **Deploy to Vercel/Netlify** (static hosting)
   - Upload the `dist/` folder

## Project Structure

```
├── client/           # Expo React Native app
│   ├── screens/      # App screens
│   ├── components/   # Reusable components
│   ├── contexts/     # React Context (Auth)
│   └── lib/          # API & utilities
├── server/           # Express.js API
│   ├── routes.ts     # API endpoints
│   └── db.ts         # Drizzle ORM config
├── shared/           # Shared schema
│   └── schema.ts     # Drizzle + Zod schemas
├── docker-compose.yml       # Production: app + db
└── docker-compose.dev.yml   # Dev: db only
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:db` | Start PostgreSQL in Docker |
| `npm run server:dev` | Start Express API (dev mode) |
| `npm run expo:local` | Start Expo web client |
| `npm run db:push` | Push schema changes to database |
| `npm run docker:up` | Start full production stack |
| `npm run docker:down` | Stop all containers |
| `npm test` | Run Playwright E2E tests |
| `npm run test:ui` | Run tests with interactive UI |
| `npm run test:headed` | Run tests in headed browser |
| `npm run test:report` | View HTML test report |

## Testing

The project includes comprehensive E2E tests using Playwright:

```bash
# Run all tests (headless)
npm test

# Run with interactive UI
npm run test:ui

# Run in headed browser (visible)
npm run test:headed

# View test report
npm run test:report
```

### Test Coverage

- **Authentication**: Guest mode, signup, login flows
- **Post Creation**: Requests, offers, contact preferences
- **Post Interaction**: View details, mark fulfilled, delete
- **Feed**: Filtering by type, category, urgent status

### CI/CD

Tests run automatically on every push and PR via GitHub Actions. See `.github/workflows/e2e.yml`.

**Deployment workflow** (`deploy-azure.yml`):
- Automatic deployment to staging on push to `main`
- Manual approval required for production
- See [docs/CI-CD.md](docs/CI-CD.md) for full documentation

### Managing Secrets

Use the GitHub CLI helper script:

```bash
# List all secrets
npm run secrets:list

# Interactive setup
npm run secrets:setup

# Set individual secret
./scripts/manage-secrets.sh set DATABASE_URL
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | Server port | `3001` |
| `EXPO_PUBLIC_DOMAIN` | API domain for client | `localhost:3001` |

## Tech Stack

- **Frontend**: Expo (React Native), TanStack Query
- **Backend**: Express.js, Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: bcrypt password hashing
- **Testing**: Playwright E2E tests
- **CI/CD**: GitHub Actions
- **Styling**: Custom theme with dark mode support
- **Node.js**: v26+

## License

MIT
