# CRM Dashboard Project Workflow

This document explains the complete workflow of the CRM Dashboard project, including architecture, setup, runtime flow, feature modules, API map, and development process.

## 1) Project Overview

- **Frontend:** React + Vite app in `frontend/`
- **Backend:** Node.js + Express API in `server/`
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT + cookie-based session flow
- **State Management:** Zustand (`frontend/src/store.js`)
- **Build Output:** `frontend/dist/`
- **Uploads:** `server/uploads/`

The project is now split per folder:
- `frontend/package.json` and `frontend/package-lock.json`
- `server/package.json` and `server/package-lock.json`

No root-level package manifest is required anymore.

## 2) High-Level Architecture

1. User opens frontend (`http://localhost:5173`).
2. Frontend calls backend API (`http://localhost:5000/api` by default).
3. Backend authenticates user from JWT cookie.
4. Backend performs DB operations in MongoDB.
5. Backend returns JSON response.
6. Frontend updates Zustand store and rerenders UI.

## 3) Folder Structure (Important Parts)

### Root

- `frontend/` - UI application
- `server/` - API server
- `README.md` - basic project notes
- `.gitignore` - ignored files (includes `node_modules`, `dist`, logs, etc.)

### Frontend (`frontend/`)

- `src/main.jsx` - app bootstrap + theme init
- `src/App.jsx` - route protection + app shell routing
- `src/store.js` - global state and all API actions
- `src/api.js` - Axios instance (`VITE_API_URL`, cookies enabled)
- `src/pages/` - page-level UI (Dashboard, Deals, Contacts, Calendar, etc.)
- `src/components/` - reusable UI and modals
- `public/` - static assets
- `dist/` - production build output (generated)

### Backend (`server/`)

- `server.js` - app entrypoint, middleware, DB connection, route mounting
- `routes/` - API route definitions
- `controllers/` - request handler logic
- `models/` - Mongoose schemas
- `middleware/` - auth + role authorization checks
- `services/` - reminder/background service triggers
- `utils/` - helper logic (mailer, activity logger)
- `uploads/` - document files stored by multer

## 4) Environment Configuration

## Backend env (`server/.env`)

Use `server/.env.example` as template:

- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/crm`
- `JWT_SECRET=change_this_secret`
- `FRONTEND_ORIGIN=http://localhost:5173`
- SMTP vars for reminder emails (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)

## Frontend env (`frontend/.env`)

Use `frontend/.env.example`:

- `VITE_API_URL=http://localhost:5000/api`

## 5) Local Setup and Run Workflow

Because frontend and server are now fully separate, run both independently.

### One-time install

```bash
cd frontend && npm install
cd ../server && npm install
```

### Run development servers (2 terminals)

Terminal 1:
```bash
cd frontend
npm run dev
```

Terminal 2:
```bash
cd server
npm run dev
```

### Build frontend

```bash
cd frontend
npm run build
```

### Optional seed script

```bash
cd server
npm run seed:demo
```

## 6) Runtime Application Flow

## A) Authentication Flow

1. User registers or logs in from frontend.
2. Frontend calls:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
3. Backend validates credentials and issues auth cookie.
4. On app load, frontend calls `GET /api/auth/me`.
5. If authenticated, protected routes are available; otherwise redirect to `/login`.

## B) Workspace-Centric Data Flow

Most CRM entities are scoped by **workspace**.

1. `fetchWorkspaces()` runs after login.
2. First workspace becomes `activeWorkspaceId`.
3. Store auto-loads workspace data (deals, dashboard stats, documents, templates, history, etc.).
4. When active workspace changes, related data refetches.

## C) Core CRUD Flow Pattern

For any module (Deals, Contacts, Events, Matters, Documents, etc.):

1. UI action triggers store method.
2. Store method calls API via Axios client.
3. Controller validates + writes to MongoDB.
4. Store updates local state.
5. UI updates immediately.

## 7) API Route Map

Mounted in `server/server.js`:

- `/api/auth`
  - `POST /register`
  - `POST /login`
  - `POST /logout`
  - `GET /me` (protected)
  - `PUT /me` (protected)

- `/api/workspaces`
  - Invitations (token lookup/accept)
  - Workspace list/create/update/delete
  - Member invite/role/remove
  - Workspace dashboard

- `/api/deals`
  - Create deal
  - Get workspace deals
  - Update deal/stage
  - Add note
  - Delete deal

- `/api/contacts`
  - List/create/update/delete

- `/api/events`
  - List/create/update/delete

- `/api/matters`
  - List/create/update/delete

- `/api/activities`
  - List with pagination

- `/api/documents`
  - Upload document
  - Workspace documents list
  - Delete
  - Download

- `/api/communications`
  - Templates CRUD (admin-restricted on create/delete)
  - Communication logging/history

- `/api/reports`
  - `GET /stats`

## 8) Authorization Workflow

- `protect` middleware secures authenticated routes.
- Role checks are handled via:
  - `checkRole([...])` for workspace permission-sensitive actions
  - `adminOnly` for restricted communication template actions

Typical role-gated operations:
- Invite/remove member
- Update member role
- Certain template management operations

## 9) Background Services

Started from `server.js` when server boots:

- `startEventReminderService()`
- `startMatterReminderService()`

These rely on SMTP configuration in backend `.env`.

## 10) Frontend State Workflow (Zustand)

Central store responsibilities:

- Auth user state (`user`)
- Workspace state (`workspaces`, `activeWorkspaceId`)
- Feature states (`deals`, `contacts`, `events`, `matters`, `activities`, `documents`, `templates`, reports)
- API actions for all modules
- UI-specific filters for pipeline

Benefits:
- Centralized API calls
- Predictable shared state
- Cleaner page components

## 11) File/Artifact Meaning

- `node_modules/` - installed dependencies (generated, safe to regenerate)
- `dist/` - frontend production build output (generated)
- `.vite/` - Vite cache (generated)
- `uploads/` - runtime document storage (keep if files matter)
- `.env` - environment secrets/config (do not commit)

## 12) Daily Development Workflow

1. Pull latest code.
2. Start MongoDB.
3. Run backend dev server.
4. Run frontend dev server.
5. Implement feature:
   - Add/modify backend route/controller/model if needed
   - Add/modify store actions
   - Update page/component UI
6. Test full flow from UI -> API -> DB -> UI.
7. Verify role-based permissions.
8. Verify upload/download and reminders if touched.
9. Build frontend before release.

## 13) Troubleshooting Checklist

- **CORS issue:** verify `FRONTEND_ORIGIN` in `server/.env`
- **Unauthorized on protected route:** check login cookie and `/auth/me`
- **API not reachable:** validate `VITE_API_URL`
- **Mongo errors:** verify `MONGODB_URI` and DB service status
- **Email reminders not sending:** verify SMTP vars
- **Upload fails:** check file size (<10MB) and `server/uploads` permission

## 14) Production Readiness Notes

- Use strong `JWT_SECRET`.
- Restrict CORS origins to real domains.
- Use managed MongoDB / secure network access.
- Secure SMTP credentials.
- Add HTTPS and reverse proxy.
- Add request validation, monitoring, and backups.

---

If this workflow changes, update this document first so team members always have a single source of truth.
