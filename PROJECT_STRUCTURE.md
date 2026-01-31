# Code Critic - Project Structure & Flow Documentation

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Folder Structure Breakdown](#folder-structure-breakdown)
- [Application Flow](#application-flow)
- [Module Architecture](#module-architecture)
- [Data Flow Diagrams](#data-flow-diagrams)

---

## 🎯 Project Overview

**Code Critic** is a Next.js-based code review platform that integrates with GitHub to provide AI-powered code analysis and review services. The application follows a modular architecture pattern with clear separation of concerns.

### Core Features Implemented:

- ✅ GitHub OAuth authentication
- ✅ Repository management and connection
- ✅ GitHub webhook integration
- ✅ Dashboard with activity statistics
- ✅ Vector database integration (Pinecone)
- ✅ Background job processing (Inngest)
- 🚧 AI-powered code review (In Progress)

---

## 🛠 Technology Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TailwindCSS 4** - Styling
- **shadcn/ui** - Component library
- **Radix UI** - Primitive components
- **React Query** - Data fetching & caching

### Backend

- **Better Auth** - Authentication solution
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Primary database
- **Inngest** - Background job processing
- **Octokit** - GitHub API integration

### AI & ML

- **Pinecone** - Vector database for embeddings
- **Google AI SDK** - Embeddings generation (Gemini)
- **Vercel AI SDK** - AI utilities

---

## 📁 Folder Structure Breakdown

### Root Level Configuration Files

```
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
├── prisma.config.ts      # Prisma configuration
├── eslint.config.mjs     # ESLint rules
├── postcss.config.mjs    # PostCSS configuration
├── components.json       # shadcn/ui configuration
└── README.md            # Basic project readme
```

---

### 🎨 `/app` Directory (Next.js App Router)

The main application directory following Next.js 13+ App Router conventions.

#### `/app/page.tsx` - Root Page

- **Purpose**: Landing page / Entry point
- **Logic**:
  - Checks authentication status using `requireAuth()`
  - Redirects authenticated users to `/dashboard`
  - Acts as a guard for the entire application

#### `/app/layout.tsx` - Root Layout

- **Purpose**: Global application wrapper
- **Providers**:
  - `ThemeProvider` - Dark/light mode support
  - `QueryProvider` - React Query context
- **Global Styles**: `globals.css` imported here
- **Fonts**: Geist Sans and Geist Mono

---

### 🔐 `/app/(auth)` - Authentication Routes Group

Route group for authentication pages (parentheses means the path won't include "(auth)" in URL).

#### `/app/(auth)/login/page.tsx`

- **Purpose**: Login page
- **Logic**:
  - Uses `requireUnAuth()` to redirect already logged-in users
  - Renders `LoginUI` component for GitHub OAuth

**Flow**:

```
User visits /login
    ↓
requireUnAuth() checks session
    ↓
If authenticated → redirect to /dashboard
If not → Show LoginUI with GitHub OAuth button
    ↓
User clicks "Sign in with GitHub"
    ↓
Redirects to /api/auth/github (Better Auth endpoint)
    ↓
GitHub OAuth flow begins
```

---

### 🏠 `/app/dashboard` - Main Application Area

Protected dashboard area requiring authentication.

#### `/app/dashboard/layout.tsx`

- **Purpose**: Dashboard wrapper layout
- **Components**:
  - `SidebarProvider` - Context for sidebar state
  - `AppSidebar` - Navigation sidebar
  - `Header` with logo, theme toggle, logout button
  - `Toaster` - Toast notifications
- **Auth Check**: `requireAuth()` at layout level protects all dashboard routes

#### `/app/dashboard/page.tsx` - Dashboard Home

- **Purpose**: Main dashboard overview
- **Data Displayed**:
  - Total repositories connected
  - Total commits (last year)
  - Pull requests count
  - AI reviews generated
  - Monthly activity chart (bar chart)
  - Contribution graph (GitHub-style heatmap)
- **Queries**:
  - `getDashboardStats` - Aggregate statistics
  - `getMonthlyActivity` - Month-by-month activity data

#### `/app/dashboard/repository/page.tsx`

- **Purpose**: Repository management interface
- **Features**:
  - List all user's GitHub repositories
  - Search/filter repositories
  - Connect/disconnect repositories
  - Infinite scroll pagination
  - Shows connection status
- **Hooks Used**:
  - `useRepository` - Fetches repositories with pagination
  - `useConnectRepository` - Mutation to connect repo

#### `/app/dashboard/settings/page.tsx`

- **Purpose**: User settings (To be implemented)

---

### 🔌 `/app/api` - API Routes

#### `/app/api/auth/[...all]/route.ts`

- **Purpose**: Better Auth catch-all route
- **Handles**:
  - Login/logout
  - Session management
  - OAuth callbacks (GitHub)
  - Token refresh
- **Exports**: `POST`, `GET` handlers from Better Auth

#### `/app/api/webhooks/github/route.ts`

- **Purpose**: GitHub webhook receiver
- **Events Handled**:
  - `ping` - Webhook verification
  - `push` - Code pushes (TODO)
  - `pull_request` - PR events (TODO)
- **Current Status**: Basic structure, event processing not implemented

#### `/app/api/inngest/route.ts`

- **Purpose**: Inngest endpoint for background jobs
- **Exports**: `GET`, `POST`, `PUT` handlers
- **Functions Registered**:
  - `indexRepository` - Indexes repository for RAG

---

### 🧩 `/app/module` - Feature Modules

This is the heart of the application logic. Each module represents a distinct feature domain.

#### 📂 Structure Convention:

```
/module/{feature}/
├── actions/         # Server actions (Next.js server functions)
├── api/            # API utilities (rarely used, prefer actions)
├── components/     # Feature-specific React components
├── hooks/          # Custom React hooks
├── lib/            # Business logic and utilities
└── utils/          # Helper functions
```

---

#### 🔐 `/app/module/auth` - Authentication Module

**Purpose**: Manages user authentication and authorization.

##### Key Files:

- **`utils/auth-utils.ts`** (inferred):
  - `requireAuth()` - Ensures user is authenticated, redirects to login if not
  - `requireUnAuth()` - Ensures user is NOT authenticated, redirects to dashboard if logged in

- **`components/login-ui.tsx`**:
  - GitHub OAuth button
  - Login form UI

- **`components/logoutButton.tsx`**:
  - Logout functionality
  - Calls Better Auth logout endpoint

**Usage Pattern**:

```typescript
// In any page requiring auth
await requireAuth(); // Throws or redirects if not authenticated

// In login page
await requireUnAuth(); // Redirects to dashboard if already logged in
```

---

#### 📦 `/app/module/repository` - Repository Management Module

**Purpose**: Handles GitHub repository connection and management.

##### `/app/module/repository/actions/index.ts`

**Server Actions**:

1. **`fetchRespositories(page, perPage)`**
   - Fetches user's GitHub repos via Octokit
   - Queries local database for connected repos
   - Merges data to show `isConnected` status
   - Returns: Array of repos with connection status

2. **`connectRepository(owner, repo, githubId)`**
   - Creates GitHub webhook for the repository
   - Stores repository in PostgreSQL via Prisma
   - Triggers Inngest event `repository/connected` for indexing
   - Returns: Webhook creation result

**Flow**:

```
User clicks "Connect" on repository
    ↓
connectRepository() called
    ↓
1. Create GitHub webhook → listens for PRs
2. Store repo in database
3. Trigger Inngest "repository/connected" event
    ↓
Inngest job indexes repository files (background)
```

##### `/app/module/repository/hooks/`

- **`use-repository.ts`**:
  - React Query infinite query for fetching repositories
  - Handles pagination automatically
- **`use-connect-repository.ts`**:
  - React Query mutation for connecting repos
  - Handles loading state and errors

---

#### 🐙 `/app/module/github` - GitHub Integration Module

**Purpose**: Centralized GitHub API interactions.

##### `/app/module/github/lib/github.ts`

**Server Functions**:

1. **`getGithubToken()`**
   - Retrieves GitHub access token from database
   - Used by all other GitHub functions

2. **`fetchUserContribution(accessToken, username)`**
   - GraphQL query to GitHub
   - Returns contribution calendar data
   - Used for dashboard contribution graph

3. **`getRespositories(page, perPage)`**
   - Lists authenticated user's repositories
   - Sorted by last updated

4. **`createWebhook(owner, repo)`**
   - Creates webhook pointing to `/api/webhooks/github`
   - Listens for `pull_request` events
   - Checks for existing webhook before creating

5. **`deleteWebhook(owner, repo)`**
   - Removes webhook from repository

6. **`getRepoFileContent(accessToken, owner, repo, path)`**
   - Recursively fetches all files from repository
   - Returns array of `{path, content}` objects
   - Used for repository indexing

---

#### 📊 `/app/module/dashboard` - Dashboard Module

**Purpose**: Aggregates and displays user statistics.

##### `/app/module/dashboard/actions/`

**Server Actions**:

1. **`getDashboardStats()`**
   - Aggregates:
     - Total repositories count
     - Total commits (from GitHub)
     - Total PRs
     - Total AI reviews
   - Returns object with all stats

2. **`getMonthlyActivity()`**
   - Calculates month-by-month activity
   - Used for bar chart visualization

##### `/app/module/dashboard/components/`

- **`contribution-graph.tsx`**:
  - GitHub-style contribution heatmap
  - Uses `react-activity-calendar`
  - Data from `fetchUserContribution()`

---

#### 🤖 `/app/module/ai` - AI/RAG Module

**Purpose**: AI-powered code analysis using RAG (Retrieval-Augmented Generation).

##### `/app/module/ai/lib/rag.ts`

**Functions**:

1. **`generateEmbeddings(text)`**
   - Uses Google Gemini embedding model
   - Converts code text to vector embeddings
   - Returns: Float array (vector)

2. **`indexCodebase(repoId, files)` (Incomplete)**
   - Takes repository files
   - Generates embeddings for each file
   - Stores vectors in Pinecone
   - **Status**: Structure defined, logic incomplete

**Planned Flow**:

```
Repository connected
    ↓
Inngest job fetches all files
    ↓
For each file:
    - Generate embedding via Gemini
    - Store in Pinecone with metadata
    ↓
PR webhook received
    ↓
Query similar code from Pinecone
    ↓
Generate AI review using context
```

---

#### ⚙️ `/app/module/settings` - Settings Module

**Purpose**: User preferences and configuration (To be implemented).

---

#### 🧪 `/app/module/test` - Test Module

**Purpose**: Testing utilities and test data (placeholder).

---

### 🎨 `/components` - Shared UI Components

#### `/components/app-sidebar.tsx`

- **Purpose**: Main navigation sidebar
- **Menu Items**:
  - Dashboard (`/dashboard`)
  - Repository (`/dashboard/repository`)
  - Reviews (`/dashboard/reviews`) - Not implemented
  - Subscription (`/dashboard/subscription`) - Not implemented
  - Settings (`/dashboard/settings`) - Not implemented
- **User Info**: Shows user avatar, name, email from session
- **GitHub Account**: Shows connected GitHub account

#### `/components/providers/`

- **`theme-provider.tsx`**: Dark/light mode provider
- **`query-provider.tsx`**: React Query client provider

#### `/components/ui/`

- **Purpose**: shadcn/ui components
- **Contains**: 50+ pre-built, customizable UI components
  - Forms, buttons, dialogs, cards, charts, etc.
  - Fully styled with Tailwind
  - Radix UI primitives underneath

#### `/components/theme-toggle.tsx`

- **Purpose**: Dark/light mode switcher button

#### `/components/separator.tsx`

- **Purpose**: Visual divider component

---

### 🪝 `/hooks` - Global Custom Hooks

#### `/hooks/use-mobile.ts`

- **Purpose**: Detects if user is on mobile device
- **Returns**: Boolean indicating mobile screen size

---

### 🔧 `/lib` - Core Library Code

#### `/lib/auth.ts` - Better Auth Configuration

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: ["repo"], // Access to repositories
    },
  },
});
```

#### `/lib/auth-client.ts`

- **Purpose**: Client-side auth utilities
- **Exports**: `useSession()` hook for accessing user session

#### `/lib/db.ts`

- **Purpose**: Prisma client singleton
- **Exports**: `prisma` instance

#### `/lib/pinecone.ts`

```typescript
export const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY!,
});

export const pineconeIndex = pineconeClient.Index(
  "code-critic-vector-embedding-v1",
);
```

#### `/lib/utils.ts`

- **Purpose**: Utility functions
- **Contains**: `cn()` for Tailwind class merging

#### `/lib/generated/prisma/`

- **Purpose**: Auto-generated Prisma client files
- **Generated By**: `prisma generate` command
- **Do Not Edit**: These files are auto-generated

---

### 🔄 `/inngest` - Background Job Processing

#### `/inngest/client.ts`

```typescript
export const inngestClient = new Inngest({ id: "code-critic" });
```

#### `/inngest/functions/index.ts`

**Inngest Functions** (Serverless background jobs):

1. **`helloWorld`** (Demo)
   - Event: `test/hello.world`
   - Purpose: Example function
   - Demonstrates step-based workflow

2. **`indexRepository`** (Active)
   - Event: `repository/connected`
   - Trigger: When user connects a repository
   - **Steps**:
     1. Fetch user's GitHub access token from DB
     2. Call `getRepoFileContent()` to get all files
     3. Index codebase (TODO - incomplete)
   - **Purpose**: Prepare repository for AI analysis

**How Inngest Works**:

- Functions are registered in `/app/api/inngest/route.ts`
- Triggered by sending events: `inngestClient.send({name: "...", data: {...}})`
- Durable execution: Steps are checkpointed, resumes after failures
- Visible in Inngest dashboard for monitoring

---

### 🗄️ `/prisma` - Database Schema & Migrations

#### `/prisma/schema.prisma` - Database Schema

**Models**:

1. **`User`**
   - Core user account
   - Fields: `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`
   - Relations: `sessions[]`, `accounts[]`, `repositories[]`

2. **`Repository`**
   - Connected GitHub repositories
   - Fields: `id`, `githubId`, `name`, `owner`, `fullName`, `url`, `userId`, `createdAt`, `updatedAt`
   - Relation: Belongs to `User`

3. **`Session`**
   - User sessions (Better Auth)
   - Fields: `id`, `expiresAt`, `token`, `ipAddress`, `userAgent`, `userId`

4. **`Account`**
   - OAuth provider accounts (GitHub)
   - Fields: `id`, `accountId`, `providerId`, `userId`, `accessToken`, `refreshToken`, etc.
   - **Important**: Stores GitHub access token

5. **`Verification`**
   - Email/phone verification tokens (Better Auth)

6. **`Test`**
   - Test model (can be removed)

#### `/prisma/migrations/`

- Migration history
- Each folder represents a database migration
- Generated by `prisma migrate dev`

---

### 🌐 `/public` - Static Assets

- Public files accessible at `/filename`
- Contains: `cc_logo.png` (Code Critic logo)

---

## 🔄 Application Flow

### 1️⃣ **Authentication Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

User visits website
        ↓
    (page.tsx)
        ↓
requireAuth() → Session exists?
        ↓                    ↓
      NO                   YES
        ↓                    ↓
Redirect to /login    Redirect to /dashboard
        ↓
User clicks "Sign in with GitHub"
        ↓
Redirect to /api/auth/github (Better Auth)
        ↓
GitHub OAuth consent screen
        ↓
User authorizes app
        ↓
GitHub redirects back with code
        ↓
Better Auth exchanges code for token
        ↓
Better Auth:
  - Creates User in database
  - Creates Account with GitHub token
  - Creates Session with token
        ↓
Redirect to /dashboard
        ↓
User is authenticated ✓
```

---

### 2️⃣ **Repository Connection Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                 REPOSITORY CONNECTION FLOW                    │
└─────────────────────────────────────────────────────────────┘

User navigates to /dashboard/repository
        ↓
useRepository hook triggered
        ↓
Calls fetchRespositories() server action
        ↓
Server action:
  1. Gets session
  2. Fetches repos from GitHub API (Octokit)
  3. Queries local DB for connected repos
  4. Merges data with isConnected flag
        ↓
Display repos with "Connect" buttons
        ↓
User clicks "Connect" on a repository
        ↓
useConnectRepository mutation triggered
        ↓
Calls connectRepository(owner, repo, githubId)
        ↓
Server action:
  1. Creates GitHub webhook
     - URL: /api/webhooks/github
     - Events: ["pull_request"]
  2. Stores repo in PostgreSQL
  3. Sends Inngest event: "repository/connected"
        ↓
Inngest indexRepository function triggered (background)
        ↓
Inngest job:
  1. Fetches GitHub access token from DB
  2. Calls getRepoFileContent() recursively
  3. Gets all files from repository
  4. [TODO] Generates embeddings
  5. [TODO] Stores in Pinecone
        ↓
Repository connected ✓
Ready for AI analysis ✓
```

---

### 3️⃣ **Dashboard Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                      DASHBOARD DATA FLOW                      │
└─────────────────────────────────────────────────────────────┘

User navigates to /dashboard
        ↓
React Query triggers queries:
  - getDashboardStats
  - getMonthlyActivity
        ↓
getDashboardStats():
  1. Gets session
  2. Counts repositories in DB
  3. Calls GitHub GraphQL for commits
  4. Counts PRs from GitHub
  5. [TODO] Counts AI reviews from DB
  6. Returns aggregated stats
        ↓
getMonthlyActivity():
  1. Gets session
  2. Queries GitHub contribution calendar
  3. Processes and groups by month
  4. Returns monthly breakdown
        ↓
Data displayed in UI:
  - Stat cards (repos, commits, PRs, reviews)
  - Bar chart (monthly activity)
  - Contribution heatmap (GitHub-style)
        ↓
Data cached by React Query
Auto-refetches on window focus (configurable)
```

---

### 4️⃣ **GitHub Webhook Flow** (Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB WEBHOOK FLOW                        │
└─────────────────────────────────────────────────────────────┘

Pull request created/updated on GitHub
        ↓
GitHub sends webhook to /api/webhooks/github
        ↓
Webhook route receives POST request
        ↓
Parse event type from header: X-GitHub-Event
        ↓
Event: "pull_request"
        ↓
[TODO] Extract PR data:
  - PR number
  - Changed files
  - Repository info
  - Author
        ↓
[TODO] Send Inngest event: "pr/analyze"
        ↓
[TODO] Inngest function:
  1. Get changed files
  2. Query Pinecone for similar code
  3. Generate AI review using LLM
  4. Post review as GitHub comment
        ↓
AI review posted on PR ✓
```

---

### 5️⃣ **RAG (Retrieval-Augmented Generation) Flow** (Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                         RAG FLOW                              │
└─────────────────────────────────────────────────────────────┘

INDEXING PHASE (When repo connected):
        ↓
Get all repository files
        ↓
For each file:
  1. Extract code content
  2. Split into chunks (if large)
  3. Generate embedding using Gemini
  4. Store in Pinecone:
     - Vector: embedding
     - Metadata: {path, repo, owner, content}
        ↓
Repository indexed ✓

RETRIEVAL PHASE (When PR received):
        ↓
Get PR changed files
        ↓
For each changed file:
  1. Generate embedding of changed code
  2. Query Pinecone for similar vectors
  3. Retrieve top-k similar code snippets
        ↓
Similar code retrieved ✓

GENERATION PHASE (AI review):
        ↓
Construct prompt:
  - Changed code
  - Similar code from Pinecone (context)
  - Review guidelines
        ↓
Call LLM (e.g., GPT-4, Gemini)
        ↓
Generate review comments
        ↓
Post to GitHub PR
        ↓
AI review complete ✓
```

---

## 🏗️ Module Architecture Patterns

### Server Actions Pattern

```typescript
// app/module/{feature}/actions/index.ts

"use server"; // Must be at top

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";

export const myAction = async (params) => {
  // 1. Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Auth check
  if (!session) {
    throw new Error("unauthenticated");
  }

  // 3. Business logic
  const result = await prisma.model.findMany({
    where: { userId: session.user.id },
  });

  // 4. Return data
  return result;
};
```

### Custom Hook Pattern

```typescript
// app/module/{feature}/hooks/use-{feature}.ts

import { useQuery } from "@tanstack/react-query";
import { myAction } from "../actions";

export const useMyFeature = () => {
  return useQuery({
    queryKey: ["feature-key"],
    queryFn: myAction,
    refetchOnWindowFocus: false, // Optional
  });
};
```

### Component Pattern

```typescript
// app/module/{feature}/components/{Component}.tsx

"use client"; // If interactive

import { useMyFeature } from "../hooks/use-{feature}";

const MyComponent = () => {
    const { data, isLoading } = useMyFeature();

    if (isLoading) return <div>Loading...</div>;

    return <div>{/* Render data */}</div>;
}

export default MyComponent;
```

---

## 📊 Data Flow Diagrams

### Database Relationships

```
┌─────────┐
│  User   │
└─────────┘
    │ 1
    │
    ├──────── has many ────────┐
    │                          │
    │ *                        │ *
┌─────────┐              ┌─────────────┐
│ Session │              │ Repository  │
└─────────┘              └─────────────┘
    │                          │
    │                          │ githubId (unique)
    │                          │ fullName
    │                          │ url
    │
    │ *
┌─────────┐
│ Account │ ← Stores GitHub access token
└─────────┘
    │
    │ providerId = "github"
    │ accessToken (used for API calls)
```

### Request Flow Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                            │
│  - React Components                                           │
│  - Custom Hooks (React Query)                                 │
│  - UI State Management                                        │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP/Fetch
┌─────────────────────────────────────────────────────────────┐
│                       NEXT.JS LAYER                           │
│  - Server Actions (app/module/*/actions)                      │
│  - API Routes (app/api/*)                                     │
│  - Middleware                                                 │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                           │
│  - Module lib/ folders                                        │
│  - Utility functions                                          │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                          │
│  - PostgreSQL (Prisma)                                        │
│  - GitHub API (Octokit)                                       │
│  - Pinecone (Vector DB)                                       │
│  - Inngest (Background Jobs)                                  │
│  - Google AI (Embeddings)                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚦 Current Implementation Status

### ✅ Fully Implemented

- GitHub OAuth authentication
- Session management
- Dashboard statistics display
- Repository listing and connection
- GitHub webhook creation
- Background job infrastructure (Inngest)
- Database schema and migrations
- UI component library

### 🚧 Partially Implemented

- Repository indexing (file fetching works, embedding storage incomplete)
- AI/RAG module (structure defined, logic incomplete)

### ❌ Not Implemented (TODO)

- GitHub webhook event processing
- AI-powered code review generation
- Pinecone vector storage
- PR comment posting
- Reviews page
- Subscription management
- Settings page
- Usage tracking
- Webhook deletion on disconnect

---

## 🔐 Environment Variables Required

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="..."
# BETTER_AUTH_URL="http://localhost:3000" # Optional

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Pinecone
PINECONE_DB_API_KEY="..."

# Inngest (optional for local dev)
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."

# App Configuration
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"

# Google AI (for embeddings)
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

---

## 🎯 Key Design Decisions

### 1. **Modular Architecture**

- Each feature is isolated in `/app/module/{feature}`
- Clear separation of concerns
- Easy to locate logic

### 2. **Server Actions over API Routes**

- Leverages Next.js 13+ server actions
- Type-safe client-server communication
- Automatic serialization

### 3. **React Query for State Management**

- No global state library (Redux, Zustand)
- Server state handled by React Query
- Automatic caching and refetching

### 4. **Better Auth over NextAuth**

- More flexible and modern
- Built-in database adapter
- Easier OAuth configuration

### 5. **Inngest for Background Jobs**

- Replaces traditional job queues (Bull, BullMQ)
- Durable execution with automatic retries
- Built-in monitoring dashboard

### 6. **Prisma over Raw SQL**

- Type-safe database queries
- Automatic migrations
- Generated client

### 7. **shadcn/ui over Component Libraries**

- Full control over components
- Copy-paste approach
- Customizable with Tailwind

---

## 📝 Naming Conventions

### Files

- **Components**: `PascalCase.tsx` (e.g., `LoginUI.tsx`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-repository.ts`)
- **Actions**: `index.ts` (in actions folder)
- **Utils**: `kebab-case.ts` (e.g., `auth-utils.ts`)
- **API Routes**: `route.ts`

### Folders

- **Features**: `kebab-case` (e.g., `/repository`)
- **Route Groups**: `(parentheses)` (e.g., `(auth)`)

### Code

- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

---

## 🚀 Getting Started

### Prerequisites

1. Node.js 20+
2. PostgreSQL database
3. GitHub OAuth app (create at github.com/settings/developers)
4. Pinecone account
5. Google AI API key

### Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

### First-Time Setup Flow

1. Visit `http://localhost:3000`
2. Redirected to `/login`
3. Click "Sign in with GitHub"
4. Authorize app
5. Redirected to `/dashboard`
6. Navigate to "Repository"
7. Connect a repository
8. Background job indexes repository

---

## 🐛 Common Issues & Solutions

### Issue: "unauthenticated" error

**Cause**: Session not found or expired
**Solution**: Logout and login again

### Issue: Repository connection fails

**Cause**: GitHub token missing or invalid scope
**Solution**: Ensure GitHub OAuth scope includes "repo"

### Issue: Inngest jobs not running

**Cause**: Inngest endpoint not reachable
**Solution**: Check `/api/inngest` is accessible, verify Inngest dev server

### Issue: Prisma client not found

**Cause**: Client not generated
**Solution**: Run `npx prisma generate`

---

## 📚 Additional Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Better Auth Documentation](https://better-auth.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query Docs](https://tanstack.com/query/latest)

---

## 🤝 Contributing Guidelines (Future)

1. Follow the modular structure
2. Use server actions for data fetching
3. Create custom hooks for actions
4. Use React Query for client state
5. Add TypeScript types
6. Update this documentation when adding features

---

**Last Updated**: January 30, 2026
**Project Status**: In Development 🚧
**Documentation Version**: 1.0
