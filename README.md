# Carlo

Carlo is a multi-tenant project management app. Teams spin up organizations, run Kanban boards, drag tasks around, invite people by email, and chat in real time. Sign-in is passwordless (magic link). It is built on Next.js 16, React 19, and Supabase.

Live site: https://carlo-app-indol.vercel.app
Built by Cahrl Louize Loyloy

## What it does

- Create organizations and switch between them. Each one is its own workspace with separate boards, members, and roles.
- Kanban boards with drag-and-drop. New boards start with To Do, In Progress, Testing, and Done, and you can add your own sections. Moves and reorders persist to the database.
- Tasks with a title, description, assignee, due date, and priority.
- Real-time everywhere. Board and task changes stream to everyone viewing the board, and chat shows live messages plus who is online.
- Per-room team chat with member management.
- Invite teammates by email as an admin or a member, then accept from an invites page.
- Optimistic UI. Sections, tasks, comments, and messages show up instantly and roll back if the server rejects them.
- A command palette (Cmd/Ctrl+K) and a top progress bar on navigation.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions, Proxy) |
| UI | [React 19](https://react.dev/) with `useOptimistic` and `useTransition` |
| Language | TypeScript 5 (strict) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) primitives |
| Components | [Radix UI](https://www.radix-ui.com/), [Lucide](https://lucide.dev/) icons, CVA variants |
| Forms | [React Hook Form](https://react-hook-form.com/) with [Zod 4](https://zod.dev/) schemas |
| Drag and drop | [@dnd-kit](https://dndkit.com/) (core and sortable) |
| Backend and DB | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row-Level Security, RPC, Realtime) |
| Auth | Supabase Auth, email magic-link OTP, cookie-based SSR sessions |
| Look and feel | Dark-only theme, Inter for text and JetBrains Mono for code and labels |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│  React 19 · shadcn/ui · dnd-kit · React Hook Form       │
│  Supabase Realtime (Postgres Changes, Broadcast,        │
│  Presence)                                              │
└────────────────────────┬────────────────────────────────┘
                         │  Server Actions (mutations)
                         │  Server Components (queries)
                         │  WebSocket (Realtime channels)
┌────────────────────────▼────────────────────────────────┐
│                   Next.js 16 Server                     │
│  Proxy (session refresh + auth redirect)                │
│  Server Actions (Zod validation, Supabase mutations)    │
│  Server Components (data fetching, RSC streaming)       │
└────────────────────────┬────────────────────────────────┘
                         │  PostgREST / Auth / RPC / Realtime
┌────────────────────────▼────────────────────────────────┐
│                      Supabase                           │
│  PostgreSQL · Row-Level Security · Auth · Realtime      │
└─────────────────────────────────────────────────────────┘
```

A few decisions worth calling out:

1. Proxy instead of classic middleware. Next.js 16 uses a `proxy.ts` entry point. Session refresh and the auth gates (redirect when signed out, force profile setup on first run) happen there before a page renders.

2. No REST API routes. Every mutation is a Server Action (`'use server'`), validated with Zod. The only Route Handler is `/auth/confirm`, which verifies the magic-link token.

3. The service layer is split. `lib/services/queries/` holds read-only server fetchers, `lib/services/actions/` holds the writes, and `lib/services/authz.ts` holds the permission gates. `getCurrentUser()` is the shared auth guard.

4. Optimistic updates with rollback. `useSectionGrid` uses React 19 `useOptimistic` for sections and local state for tasks. A failed mutation reverts the UI back to server state. Deletions go through a small deletions context so a row can hide instantly and come back if the delete fails.

5. Realtime in three shapes. Board lists subscribe to `postgres_changes` scoped by `org_id`. A board's sections and tasks subscribe to `postgres_changes` scoped by `board_id` and refetch on change (debounced). Chat uses broadcast for messages and presence for online status, one channel per room.

6. Some writes go through Postgres RPCs. Invitation acceptance, organization deletion, and chat room creation and membership are RPCs, which keeps those multi-row writes atomic.

## Project structure

```
carlo-app/
├── app/
│   ├── (non-sidebar)/                # full-screen flows
│   │   ├── page.tsx                  # home: your organizations
│   │   ├── create/                   # create an organization
│   │   ├── profile/                  # edit your profile
│   │   └── invites/                  # invitations addressed to you
│   ├── (sidebar)/                    # app shell with sidebar + org context
│   │   └── organization/[orgId]/
│   │       ├── page.tsx              # boards in the org
│   │       ├── board/[boardId]/      # a board (sections + tasks)
│   │       ├── members/              # members + invitations
│   │       ├── settings/             # org settings
│   │       └── inbox/                # chat rooms + messages
│   ├── auth/
│   │   ├── login/                    # magic-link login
│   │   ├── setup/                    # first-run profile name
│   │   └── confirm/route.ts          # OTP verification endpoint
│   └── layout.tsx                    # root layout (fonts, top loader, providers)
├── components/
│   ├── auth/                         # login + profile-setup forms
│   ├── board/                        # board list, create/update dialogs
│   ├── section/                      # section grid, drag-and-drop, forms
│   ├── task/                         # task cards, sortable items, detail sheet
│   ├── organization/                 # org list, settings, invite dialog
│   ├── inbox/                        # chat view, conversation list, room dialogs
│   ├── invitation/                   # accept/decline actions
│   ├── profile/                      # profile form
│   ├── shell/                        # app shell, sidebar, topbar, command palette
│   ├── common/                       # shared UI (buttons, modal, form, avatar, icons)
│   └── ui/                           # shadcn primitives
├── context/
│   ├── auth-context.tsx              # current user + profile
│   ├── org-context.tsx               # active organization
│   └── deletions-context.tsx         # optimistic delete + rollback bookkeeping
├── hooks/
│   ├── use-board-realtime.ts         # live sections/tasks for a board
│   ├── use-section-grid.ts           # drag-and-drop + optimistic board state
│   ├── use-task-comments.ts          # task comments: load, live stream, optimistic post
│   ├── use-realtime-chat.ts          # broadcast chat messaging
│   └── use-presence.ts               # channel presence (who is online)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # browser client (anon key)
│   │   ├── server.ts                 # server client (cookie-aware)
│   │   └── middleware.ts             # session refresh + auth redirect
│   ├── services/
│   │   ├── queries/                  # server-only reads (incl. current-user, member)
│   │   ├── actions/                  # server actions (create/update/move/delete)
│   │   └── authz.ts                  # permission gates (canAccess/canModify/isOwner)
│   ├── schemas/                      # Zod schemas per domain
│   ├── board-ui.ts                   # board/section display helpers
│   ├── types.ts                      # domain types
│   └── utils.ts                      # date and misc helpers
└── proxy.ts                          # Next.js 16 proxy (session refresh entry)
```

## Features in detail

### Organizations
Create, rename, and switch between organizations. Each one is an isolated workspace with its own boards, members, and settings. The sidebar has an org switcher.

### Kanban boards
An org can have many boards. Each new board starts with the default sections (To Do, In Progress, Testing, Done) and you can add more. Tasks drag and drop to reorder or move between sections, and the new order is saved.

### Tasks
A task has a title, description, assignee (any org member), due date, and priority. Open a task to see its details and comments, and edit it inline.

### Team collaboration
Invite members by email as an admin or a member. Duplicate invites are blocked, and there is a dedicated page to accept invitations. Members are listed with their profile details.

### Real-time messaging
Each org has built-in chat. Create named rooms and add members, send messages that broadcast to everyone connected, and see how many people are currently in a room through Supabase Presence. The conversation list sorts by latest activity and has a search filter.

### Real-time board updates
Board lists update when any board in the org is created, changed, or removed. Inside a board, section and task changes (including cross-section moves) trigger a debounced refetch so everyone stays in sync.

### Authentication flow
1. Enter your email on the login page.
2. Supabase sends a magic-link OTP.
3. Clicking the link hits `/auth/confirm`, which verifies the token.
4. The proxy checks whether your profile name is set.
5. First-time users go to `/auth/setup` to finish their profile.
6. After that, cookie-based sessions keep you signed in.

## Data model

```
user_profile
├── id (PK, matches auth.users.id)
├── name
├── email
├── image_url
└── timestamps

organization
├── id (PK)
├── name
├── owner_id -> user_profile.id
└── timestamps

organization_member
├── org_id -> organization.id
├── member_id -> user_profile.id
├── role (owner | admin | member)
├── status (pending | accepted)
└── created_at

organization_invitation
├── id (PK)
├── org_id -> organization.id
├── email
├── role
├── status (pending | accepted)
├── invited_by -> user_profile.id
├── expires_at
└── timestamps

board
├── id (PK)
├── title
├── description
├── org_id -> organization.id
├── creator_id -> user_profile.id
└── timestamps

section
├── id (PK)
├── title
├── sort_order
├── board_id -> board.id
├── creator_id -> user_profile.id
└── created_at

task
├── id (PK)
├── title
├── description
├── section_id -> section.id
├── sort_order
├── creator_id -> user_profile.id
├── assignee_id -> user_profile.id
├── due_date
├── priority (low | medium | high)
└── timestamps

task_comment
├── id (PK)
├── task_id -> task.id
├── author_id -> user_profile.id
├── text
└── created_at

chat_room
├── id (PK)
├── name
├── org_id -> organization.id
├── created_by -> user_profile.id
└── timestamps

chat_room_member
├── chat_room_id -> chat_room.id
├── member_id -> user_profile.id
├── role
└── joined_at

message
├── id (PK)
├── chat_room_id -> chat_room.id
├── author_id -> user_profile.id
├── text
└── created_at
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (Next.js 16 requires it).
- A [Supabase](https://supabase.com/) project (the free tier is fine).

### Setup

1. Clone and install.

   ```bash
   git clone https://github.com/your-username/carlo-app.git
   cd carlo-app
   npm install
   ```

2. Add environment variables. Create `.env.local` in the root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

   Only the public anon key belongs here. The service-role key should never be in the app.

3. Set up the database. The schema and Row-Level Security live in the Supabase dashboard. Create the tables from the [Data model](#data-model) section, enable RLS, and add the RPC functions the actions call: `accept_organization_invitation`, `create_chat_room`, `add_chat_room_members`, `delete_chat_room`, and `delete_organization`. Then enable Realtime on `board`, `section`, `task`, and `task_comment` (chat uses broadcast channels, so the `message` table does not need it).

4. Run it.

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Roadmap

- [x] Real-time team messaging
- [x] Real-time board updates
- [ ] Live conversation list (refresh the sidebar on new messages without reopening a room)
