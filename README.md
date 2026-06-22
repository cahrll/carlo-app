# Carlo

Carlo is a multi-tenant project management app. Teams create organizations, open Kanban boards, drag tasks around, invite people by email, and chat in real time. No passwords, just a magic link to sign in. It runs on Next.js 16, React 19, and Supabase.

Live site: https://carlo-app-indol.vercel.app
Built by Cahrl Louize Loyloy

## What it does

- Organizations you can create and switch between. Each is its own workspace with separate boards, members, and roles.
- Kanban boards with drag-and-drop. A new board comes with To Do, In Progress, Testing, and Done, and you can add sections of your own. Moves and reorders are saved to the database.
- Tasks that hold a title, description, assignee, due date, and priority.
- Real-time updates. Move a task or change a board and everyone watching sees it, and chat shows new messages as they land plus who is online.
- Team chat, one conversation per room, with member management.
- Email invites. Bring someone in as an admin or a member, and they accept from their invites page.
- Optimistic UI. Sections, tasks, comments, and messages show up the moment you act and roll back if the server says no.
- A command palette on Cmd/Ctrl+K, and a progress bar across the top while a page loads.

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

A few choices that shaped the code:

1. Proxy instead of classic middleware. Next.js 16 hands this off to a `proxy.ts` entry point, so that is where session refresh and the auth gates live: redirect you to login when you are signed out, push you to profile setup on a first run. All of it before the page renders.

2. No REST API routes. Every mutation is a Server Action (`'use server'`) with a Zod schema in front of it. The only Route Handler in the whole app is `/auth/confirm`, which verifies the magic-link token.

3. Reads, writes, and permissions stay separate. `lib/services/queries/` fetches data, `lib/services/actions/` changes it, and `lib/services/authz.ts` decides who is allowed to. They all share one auth guard, `getCurrentUser()`.

4. Optimistic updates that can undo themselves. `useSectionGrid` uses React 19's `useOptimistic` for sections and local state for tasks. If a mutation fails, the UI snaps back to the last thing the server confirmed. Deletions run through a small deletions context, so a row can vanish right away and come back if the delete does not go through.

5. Realtime in three shapes. Board lists subscribe to `postgres_changes` scoped by `org_id`. A board's sections and tasks subscribe by `board_id` and refetch (debounced) when something changes. Chat works differently: broadcast for messages, presence for online status, one channel per room.

6. A few writes go through Postgres RPCs. Accepting an invitation, deleting an organization, and creating a chat room or adding members are all RPCs, which keeps those multi-row writes atomic.

## Project structure

```
carlo-app/
├── app/          # routes: org boards, a board, members, settings, inbox, auth
├── components/   # UI by domain: board, section, task, organization, inbox, shell, ui
├── context/      # current user, active org, optimistic-deletion state
├── hooks/        # board realtime, drag-and-drop board state, comments, chat, presence
├── lib/
│   ├── supabase/ # browser + server clients, session middleware
│   ├── services/ # queries (reads), actions (writes), authz (permission gates)
│   └── schemas/  # Zod schemas per domain
└── proxy.ts      # Next.js 16 proxy: session refresh + auth redirect
```

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
