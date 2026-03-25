# CollabDocs — Real-Time Collaborative Document Editor

<div align="center">

![CollabDocs Banner](https://img.shields.io/badge/CollabDocs-Real--Time%20Editor-1a73e8?style=for-the-badge&logo=googledocs&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT%20Sync-orange?style=flat-square)](https://yjs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A Google Docs-style collaborative editor with real-time sync, version history, comments, and role-based access control.**

[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
  - [System Diagram](#system-diagram)
  - [Project Structure](#project-structure)
  - [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [WebSocket Protocol](#websocket-protocol)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Permissions & Roles](#permissions--roles)
- [Real-Time Collaboration](#real-time-collaboration)
- [Version History](#version-history)
- [Comments System](#comments-system)
- [Security](#security)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CollabDocs is a full-stack, real-time collaborative document editor inspired by Google Docs. Multiple users can edit the same document simultaneously, see each other's cursors, leave threaded comments, and restore previous versions — all without conflicts, thanks to **Yjs CRDT** (Conflict-free Replicated Data Type) synchronization over WebSockets.

The backend is a **Python FastAPI** async REST + WebSocket server backed by **PostgreSQL**. The frontend is a **React + Quill** single-page application that communicates with the backend via REST for CRUD operations and via WebSocket for real-time document sync.

---

## Features

| Category | Feature |
|----------|---------|
| **Editor** | Rich-text editing (headings, bold, italic, lists, links) via Quill.js |
| **Collaboration** | Real-time multi-user editing with CRDT conflict resolution (Yjs) |
| **Presence** | Live cursor positions and user avatars for active collaborators |
| **Persistence** | Auto-save to PostgreSQL every 2 seconds after user activity stops |
| **Offline** | Offline-first — Yjs buffers changes locally and syncs on reconnect |
| **Auth** | JWT-based register/login; stateless, no session store needed |
| **Permissions** | Three-tier RBAC: Owner, Editor, Viewer per document |
| **Sharing** | Share any document with any registered user by email |
| **Versions** | Full version history; create named snapshots; one-click restore |
| **Comments** | Threaded comments anchored to text selections; resolve/unresolve |
| **UI** | Material UI, responsive layout, light/dark-mode ready |

---

## Tech Stack

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | [FastAPI](https://fastapi.tiangolo.com) | Async REST API + WebSocket endpoints |
| Language | Python 3.11+ | |
| ORM | [SQLAlchemy 2.x](https://www.sqlalchemy.org) (async) | Database models and queries |
| Database | [PostgreSQL 15](https://www.postgresql.org) | Persistent storage |
| Auth | [python-jose](https://github.com/mpdavis/python-jose) + [passlib](https://passlib.readthedocs.io) | JWT creation/verification, bcrypt hashing |
| Validation | [Pydantic v2](https://docs.pydantic.dev) | Request/response schemas |
| Migrations | [Alembic](https://alembic.sqlalchemy.org) | Schema migrations (production) |
| Driver | [asyncpg](https://github.com/MagicStack/asyncpg) | Async PostgreSQL driver |

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | [React 18](https://react.dev) | UI components |
| Build tool | [Vite](https://vitejs.dev) | Fast dev server + bundler |
| Editor | [Quill.js](https://quilljs.com) | Rich-text editing engine |
| CRDT Sync | [Yjs](https://yjs.dev) + [y-websocket](https://github.com/yjs/y-websocket) | Real-time conflict-free sync |
| Quill ↔ Yjs | [y-quill](https://github.com/yjs/y-quill) | Binding between Quill and Yjs |
| UI Library | [MUI (Material UI) v5](https://mui.com) | Component library |
| HTTP Client | [Axios](https://axios-http.com) | REST API calls |
| State | [Zustand](https://zustand-demo.pmnd.rs) | Lightweight global state |
| Routing | [React Router v6](https://reactrouter.com) | Client-side routing |
| Dates | [date-fns](https://date-fns.org) | Human-readable timestamps |
| Toasts | [react-hot-toast](https://react-hot-toast.com) | Notifications |

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                     │
│                                                                 │
│  ┌──────────────┐   REST (HTTP/JSON)   ┌──────────────────────┐ │
│  │  Zustand     │◄────────────────────►│   FastAPI REST API   │ │
│  │  Stores      │                      │   /api/v1/...        │ │
│  └──────────────┘                      └──────────┬───────────┘ │
│                                                   │SQLAlchemy   │
│  ┌──────────────┐   WebSocket (binary)  ┌─────────▼───────────┐ │
│  │  Yjs Doc     │◄────────────────────►│   FastAPI WS Server  │ │
│  │  + y-quill   │    Yjs CRDT updates  │   /ws/{document_id}  │ │
│  │  + Quill     │                      └──────────┬───────────┘ │
│  └──────────────┘                                 │             │
└─────────────────────────────────────────────────────────────────┘
                                                    │
                              ┌─────────────────────▼──────────────┐
                              │           PostgreSQL                │
                              │                                    │
                              │  users  documents  permissions     │
                              │  versions  comments  operations    │
                              └────────────────────────────────────┘
```

### Project Structure

```
collabdocs/
├── backend/                        # FastAPI application
│   ├── app/
│   │   ├── main.py                 # App factory, middleware, router registration
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings (reads .env)
│   │   │   ├── database.py         # Async SQLAlchemy engine + session factory
│   │   │   ├── security.py         # JWT encode/decode, bcrypt helpers
│   │   │   └── exceptions.py       # Custom HTTP exception classes
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── permission.py
│   │   │   ├── comment.py
│   │   │   ├── version.py
│   │   │   └── operation.py
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── permission.py
│   │   │   ├── comment.py
│   │   │   ├── version.py
│   │   │   └── operation.py
│   │   ├── repositories/           # Database access layer
│   │   │   ├── base.py             # Generic CRUD repository
│   │   │   ├── user_repository.py
│   │   │   ├── document_repository.py
│   │   │   ├── permission_repository.py
│   │   │   ├── comment_repository.py
│   │   │   ├── version_repository.py
│   │   │   └── operation_repository.py
│   │   ├── services/               # Business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── document_service.py
│   │   │   ├── permission_service.py
│   │   │   ├── comment_service.py
│   │   │   ├── version_service.py
│   │   │   ├── operation_service.py
│   │   │   └── websocket_manager.py  # In-memory room/connection manager
│   │   └── api/
│   │       ├── dependencies.py     # get_current_user, get_optional_user
│   │       ├── middleware/
│   │       │   ├── auth_middleware.py    # JWT decode → request.state.user_id
│   │       │   └── logging_middleware.py # Request/response timing logs
│   │       └── v1/
│   │           ├── endpoints/
│   │           │   ├── auth.py
│   │           │   ├── documents.py
│   │           │   ├── permissions.py
│   │           │   ├── versions.py
│   │           │   └── comments.py
│   │           └── websocket/
│   │               └── document_ws.py  # /ws/{document_id}
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/                       # React + Vite SPA
    ├── src/
    │   ├── main.jsx                # React root, ThemeProvider, Router, Toaster
    │   ├── App.jsx                 # Route declarations
    │   ├── assets/
    │   │   ├── theme.js            # MUI theme configuration
    │   │   └── index.css           # Global CSS resets
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── DocumentEditor.jsx  # Full editor page (AppBar + Editor + Drawers)
    │   │   └── NotFound.jsx
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Layout.jsx      # Navbar + <Outlet />
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Loading.jsx
    │   │   │   └── ErrorBoundary.jsx
    │   │   ├── editor/
    │   │   │   ├── Editor.jsx      # Quill + Yjs + WebsocketProvider
    │   │   │   └── PresenceAvatars.jsx
    │   │   ├── document/
    │   │   │   ├── DocumentList.jsx
    │   │   │   ├── DocumentCard.jsx
    │   │   │   ├── CreateDocumentDialog.jsx
    │   │   │   └── ShareDialog.jsx
    │   │   ├── comments/
    │   │   │   ├── CommentSidebar.jsx
    │   │   │   ├── CommentThread.jsx
    │   │   │   └── CommentInput.jsx
    │   │   └── versions/
    │   │       ├── VersionHistory.jsx
    │   │       └── VersionItem.jsx
    │   ├── store/                  # Zustand stores
    │   │   ├── authStore.js
    │   │   ├── documentStore.js
    │   │   ├── commentStore.js
    │   │   └── presenceStore.js
    │   ├── services/               # Axios API wrappers
    │   │   ├── api.js              # Axios instance + interceptors
    │   │   ├── auth.service.js
    │   │   ├── document.service.js
    │   │   ├── comment.service.js
    │   │   ├── permission.service.js
    │   │   └── version.service.js
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useDocument.js
    │   │   ├── usePresence.js
    │   │   └── useWebSocket.js
    │   ├── routes/
    │   │   ├── AppRoutes.jsx
    │   │   └── ProtectedRoute.jsx
    │   └── utils/
    │       ├── constants.js
    │       ├── validators.js
    │       ├── colors.js
    │       └── wsMessages.js
    ├── .env.example
    ├── index.html
    └── vite.config.js
```

### Data Flow

**REST request lifecycle:**
```
Browser → Axios (attaches Bearer token)
       → FastAPI (LoggingMiddleware → AuthMiddleware → Router)
       → Depends(get_current_user) resolves User from JWT
       → Service layer (business logic + permission checks)
       → Repository layer (SQLAlchemy async queries)
       → PostgreSQL
       → Pydantic response model serialized to JSON
       → Browser
```

**Real-time edit lifecycle:**
```
User types in Quill
  → Quill fires 'text-change' (source='user')
  → y-quill converts delta → Yjs update
  → Yjs encodes binary update
  → y-websocket sends bytes to /ws/{document_id}
  → WebSocket handler broadcasts bytes to all other clients in room
  → Each client's Yjs doc applies the update (CRDT merge)
  → y-quill reflects the merged state back into Quill
  → After 2s idle: auto-save POSTs Quill Delta to REST API → PostgreSQL
```

---

## Database Schema

```
┌──────────────┐         ┌─────────────────┐         ┌──────────────┐
│    users     │         │    documents    │         │ permissions  │
├──────────────┤         ├─────────────────┤         ├──────────────┤
│ id (UUID PK) │◄────────│ owner_id (FK)   │◄────────│ document_id  │
│ email        │         │ id (UUID PK)    │         │ user_id (FK) │
│ username     │         │ title           │         │ role         │
│ password_hash│         │ content (JSON)  │         │   owner      │
│ full_name    │         │ is_public       │         │   editor     │
│ avatar_url   │         │ last_edited_at  │         │   viewer     │
│ is_active    │         │ last_edited_by  │         │ granted_by   │
│ created_at   │         │ created_at      │         │ granted_at   │
│ updated_at   │         │ updated_at      │         └──────────────┘
└──────────────┘         └─────────────────┘
       │                        │
       │                 ┌──────┴──────┐──────────────────────┐
       │                 │             │                      │
       │          ┌──────▼──────┐ ┌───▼────────┐  ┌─────────▼──────┐
       │          │  versions   │ │  comments  │  │  operations    │
       │          ├─────────────┤ ├────────────┤  ├────────────────┤
       │          │ id (UUID PK)│ │ id (UUID)  │  │ id (BigInt PK) │
       └─────────►│ document_id │ │ document_id│  │ document_id    │
                  │ version_num │ │ user_id    │  │ user_id        │
                  │ content JSON│ │ parent_id  │  │ operation (bin)│
                  │ created_by  │ │ content    │  │ version        │
                  │ comment     │ │ selection  │  │ timestamp      │
                  │ created_at  │ │ resolved   │  └────────────────┘
                  └─────────────┘ │ created_at │
                                  │ updated_at │
                                  └────────────┘
```

### Key design decisions

- **`content` stored as JSON (Quill Delta format)** — preserves rich-text formatting natively; avoids HTML sanitization concerns.
- **`permissions` table with unique constraint on `(document_id, user_id)`** — ensures one role per user per document. The owner always has the `owner` role row.
- **`operations` table (binary, versioned)** — stores raw Yjs binary updates for potential replay/audit. Not used in the main sync path today but available for future history diffing.
- **Soft references via `last_edited_by`** — `documents.last_edited_by` is a nullable FK to `users` so it survives user deletion.

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

All endpoints except `/auth/login` and `/auth/register` require:
```
Authorization: Bearer <access_token>
```

### Authentication

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/auth/register` | `UserCreate` | `Token` | Create account + return JWT |
| `POST` | `/auth/login` | `OAuth2PasswordRequestForm` | `Token` | Login + return JWT |
| `GET` | `/auth/me` | — | `UserResponse` | Current user info |
| `POST` | `/auth/logout` | — | `{message}` | Client-side logout (stateless) |

**`UserCreate` body:**
```json
{
  "email": "alice@example.com",
  "username": "alice",
  "full_name": "Alice Smith",
  "password": "supersecret123"
}
```

**`Token` response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "username": "alice",
    "full_name": "Alice Smith",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Documents

| Method | Endpoint | Query | Response | Description |
|--------|----------|-------|----------|-------------|
| `GET` | `/documents/` | `skip`, `limit` | `DocumentListResponse[]` | List your documents |
| `POST` | `/documents/` | — | `DocumentResponse` | Create a document |
| `GET` | `/documents/{id}` | — | `DocumentResponse` | Get a document |
| `PUT` | `/documents/{id}` | — | `DocumentResponse` | Update title / content / visibility |
| `DELETE` | `/documents/{id}` | — | `204` | Delete (owner only) |
| `POST` | `/documents/{id}/share` | — | `{message}` | Share with a user |

**`DocumentCreate` body:**
```json
{ "title": "My First Doc" }
```

**`DocumentResponse`:**
```json
{
  "id": "550e8400-...",
  "title": "My First Doc",
  "content": { "ops": [{ "insert": "Hello world\n" }] },
  "owner_id": "...",
  "is_public": false,
  "last_edited_at": "2024-01-15T10:35:00Z",
  "last_edited_by": "...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**`ShareDocumentRequest` body:**
```json
{ "user_email": "bob@example.com", "role": "editor" }
```

---

### Permissions

| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| `GET` | `/permissions/document/{id}` | `PermissionResponse[]` | List all permissions on a document |
| `POST` | `/permissions/` | `PermissionResponse` | Grant a permission |
| `DELETE` | `/permissions/{id}` | `204` | Revoke a permission |
| `GET` | `/permissions/check/{doc_id}?required_role=editor` | `{has_permission}` | Check your access level |

---

### Versions

| Method | Endpoint | Query | Response | Description |
|--------|----------|-------|----------|-------------|
| `GET` | `/versions/document/{id}` | — | `VersionResponse[]` | All versions, newest first |
| `POST` | `/versions/document/{id}` | `comment` (optional) | `VersionResponse` | Snapshot current content |
| `GET` | `/versions/{version_id}` | — | `VersionResponse` | Get a specific version |
| `POST` | `/versions/{version_id}/restore` | `document_id` | `VersionResponse` | Restore + create new snapshot |

---

### Comments

| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| `GET` | `/comments/document/{id}` | `CommentResponse[]` | All comments on a document |
| `POST` | `/comments/` | `CommentResponse` | Add a comment |
| `PUT` | `/comments/{id}` | `CommentResponse` | Edit your comment |
| `DELETE` | `/comments/{id}` | `204` | Delete your comment |
| `POST` | `/comments/{id}/resolve` | `CommentResponse` | Resolve a comment |

**`CommentCreate` body:**
```json
{
  "document_id": "550e8400-...",
  "content": "This paragraph needs more detail.",
  "selection": { "text": "selected text", "index": 42, "length": 13 },
  "parent_id": null
}
```

---

## WebSocket Protocol

**Endpoint:** `ws://localhost:8000/ws/{document_id}?token=<jwt>`

The WebSocket layer carries **only binary Yjs messages**. No JSON is sent over this connection.

### Connection flow

```
Client                                  Server
  │                                       │
  │── GET /ws/{doc_id}?token=... ─────────►│
  │◄─ 101 Switching Protocols ────────────│
  │                                       │  Auth check (JWT + DB permission)
  │                                       │  Connect to in-memory room
  │── [Yjs sync step 1 binary] ──────────►│
  │◄─ [Yjs sync step 2 binary] ───────────│
  │◄─ [Yjs awareness states] ─────────────│  (other users' cursors/colors)
  │                                       │
  │── [Yjs update: user typed] ──────────►│  broadcast to all other clients
  │◄─ [Yjs update: other user] ───────────│
  │                                       │
  │── websocket.disconnect ──────────────►│  room cleanup
```

### Authentication over WebSocket

JWT is passed as a query parameter (`?token=...`) because browsers cannot set `Authorization` headers on WebSocket upgrades. The token is validated server-side before the connection is accepted into a room.

### Yjs awareness

Each client's `y-websocket` provider broadcasts an **awareness state** containing:
```js
{
  user: {
    id: "uuid",
    name: "alice",
    color: "hsl(240, 70%, 60%)"   // deterministic from user id
  }
}
```

This powers the live presence avatars shown in the document toolbar.

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ running locally (or via Docker)

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/collabdocs.git
cd collabdocs/backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env — fill in POSTGRES_PASSWORD and generate a SECRET_KEY:
# python -c "import secrets; print(secrets.token_hex(32))"

# 5. Create the database
psql -U postgres -c "CREATE DATABASE editor_db;"

# 6. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd collabdocs/frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Default values work for local development

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Docker Compose (optional)

```yaml
# docker-compose.yml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: editor_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "8000:8000"
    depends_on:
      - db
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

```bash
docker-compose up --build
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ | — | 256-bit random hex string for JWT signing. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | ❌ | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `60` | JWT lifetime in minutes |
| `POSTGRES_SERVER` | ❌ | `localhost` | Database host |
| `POSTGRES_USER` | ❌ | `postgres` | Database user |
| `POSTGRES_PASSWORD` | ✅ | — | Database password |
| `POSTGRES_DB` | ❌ | `editor_db` | Database name |
| `DATABASE_URL` | ❌ | auto-built | Override the full asyncpg connection string |

### Frontend (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ❌ | `http://localhost:8000/api/v1` | Backend REST base URL |
| `VITE_WS_URL` | ❌ | `ws://localhost:8000/ws` | WebSocket base URL |

---

## Authentication

CollabDocs uses **stateless JWT authentication**.

### Token lifecycle

```
Register/Login → Server issues signed JWT (HS256)
              → Client stores token in localStorage (via Zustand persist)
              → Every HTTP request: Axios interceptor reads token → sets Authorization header
              → Every WS connection: token passed as ?token= query param
              → Token expires after ACCESS_TOKEN_EXPIRE_MINUTES (default 60)
              → On 401: Axios interceptor clears storage → redirects to /login
```

### How the server resolves users

The `AuthMiddleware` decodes the JWT on every HTTP request and caches `user_id` on `request.state`. The `get_current_user` dependency reads from `request.state` first (cheap, no DB hit), falling back to re-decoding the raw token from the `Authorization` header if state isn't populated.

Deactivated users (`is_active=False`) are rejected with `403 Forbidden` even if their JWT is valid.

---

## Permissions & Roles

Every document has exactly **one owner** and any number of editors/viewers.

| Role | Read | Write | Share | Delete | Version | Resolve comments |
|------|------|-------|-------|--------|---------|-----------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Rules

- Only the **owner** can share a document or revoke permissions.
- The owner's own `OWNER` permission row cannot be revoked or downgraded.
- Sharing a document that a user already has access to **updates** their role (upsert).
- Permission checks hit the DB once per request; the `owner_id` column is checked first to avoid a join for the most common case.

---

## Real-Time Collaboration

### How Yjs works in this project

[Yjs](https://yjs.dev) is a CRDT library. A **CRDT** (Conflict-free Replicated Data Type) is a data structure designed so that concurrent edits from multiple users can always be merged without conflicts — no "last write wins" collisions.

```
User A types "Hello"    User B types "World"
Both have network lag.

Without CRDT:  "Hello" OR "World"  ← one overwrites the other
With CRDT:     "HelloWorld"        ← both changes merged deterministically
```

### Components

| Component | Role |
|-----------|------|
| `Y.Doc` | The shared document state. Each client has one. |
| `ytext = ydoc.getText('quill')` | The shared text type mapped to Quill's content. |
| `WebsocketProvider` | Connects the `Y.Doc` to the server; syncs binary updates. |
| `QuillBinding` | Keeps Quill's Delta and the Yjs text type in sync bidirectionally. |
| `provider.awareness` | Broadcast-only channel for ephemeral state (cursors, user info). |

### Seeding from the database

When a user opens a document, Yjs syncs with the server first. The sync protocol checks if the server's Yjs state is empty. If it is (first user opening the doc), the client **seeds** the Yjs text from the database's stored Quill Delta. Subsequent users receive the already-populated Yjs state directly from the first user via the server relay.

### Auto-save

Quill's `text-change` event fires on every keystroke. The editor only acts on changes where `source === 'user'` (ignoring Yjs-driven remote updates). A 2-second debounced timer saves the current Quill Delta to the REST API → PostgreSQL.

---

## Version History

Versions are explicit snapshots of a document's content at a point in time.

### Creating a version

```
POST /versions/document/{id}?comment=Before+major+refactor
```

This copies the current `documents.content` JSON into a new `versions` row with an auto-incremented `version_number`.

### Restoring a version

```
POST /versions/{version_id}/restore?document_id={id}
```

This:
1. Sets `documents.content` to the version's content.
2. Creates a **new version** snapshot with the comment `"Restored from version N"` — preserving the full audit trail.
3. Returns the new version.

> **Note:** Restoring a version updates the PostgreSQL record but does not automatically push the change to currently-connected Yjs clients. After a restore, collaborators should refresh their page to receive the restored content via the initial database seed.

---

## Comments System

Comments are threaded and can be anchored to a text selection.

### Data model

```
Comment
├── id, document_id, user_id
├── content          ← the comment text
├── selection        ← JSON: { text, index, length } — the highlighted text
├── parent_id        ← null for top-level; UUID for replies
├── resolved         ← boolean
└── created_at / updated_at
```

### Threading

- Top-level comments have `parent_id = null`.
- Replies set `parent_id` to the parent comment's ID.
- The API returns all comments flat; the frontend groups replies by `parent_id`.
- Cross-document parent references are rejected server-side (a reply must belong to the same document as its parent).

### Resolving

Any collaborator (owner or comment author) can mark a comment resolved. Resolved comments are visually dimmed but preserved in the record.

---

## Security

| Concern | Mitigation |
|---------|-----------|
| Password storage | bcrypt with work factor 12 (via passlib) — never stored plain |
| JWT signing | HS256 with a 256-bit secret key loaded from environment |
| Token expiry | Configurable; default 60 minutes |
| SQL injection | All queries use SQLAlchemy's parameterized ORM — no raw string interpolation |
| CORS | Explicit origin allowlist (`localhost:3000`); update for production |
| Input validation | Pydantic v2 validates all request bodies with type coercion |
| Permission checks | Every service method checks ownership/role before acting |
| Owner demotion | Server rejects attempts to downgrade or revoke the owner's own permission |
| Account deactivation | `is_active=False` blocks login and all API access even with a valid token |
| Query limits | `skip`/`limit` params validated with `ge=0, le=200` bounds |
| WebSocket auth | JWT verified server-side before connection is admitted to a room |

### Production hardening checklist

- [ ] Set `SECRET_KEY` to a cryptographically random 256-bit value (never reuse dev keys)
- [ ] Set `ACCESS_TOKEN_EXPIRE_MINUTES` to a shorter window (e.g. 30 minutes) + implement refresh tokens
- [ ] Change CORS `allow_origins` from `localhost` to your actual frontend domain
- [ ] Set `echo=False` in SQLAlchemy engine (already done in this codebase)
- [ ] Run behind HTTPS (TLS termination at reverse proxy — nginx/Caddy)
- [ ] Use Alembic for database migrations instead of `create_all`
- [ ] Add rate limiting (e.g. `slowapi`) on `/auth/login` and `/auth/register`
- [ ] Store JWTs in `httpOnly` cookies instead of localStorage to prevent XSS token theft

---

## Development Guide

### Running tests

```bash
# Backend (pytest + pytest-asyncio)
cd backend
pip install pytest pytest-asyncio httpx
pytest tests/ -v

# Frontend (Vitest)
cd frontend
npm run test
```

### Code style

```bash
# Backend
pip install ruff black
ruff check app/        # lint
black app/             # format

# Frontend
npm run lint           # ESLint
npm run format         # Prettier
```

### Adding a new endpoint

1. Add the Pydantic schema to `app/schemas/`.
2. Add any required DB columns to the SQLAlchemy model in `app/models/`.
3. Add repository methods in `app/repositories/`.
4. Add business logic in `app/services/`.
5. Add the route in `app/api/v1/endpoints/`.
6. Register the router in `app/main.py` if it's a new router file.

### Adding a new frontend feature

1. Add the API call to the relevant `src/services/*.service.js`.
2. Update or create a Zustand store in `src/store/`.
3. Build the React component in `src/components/`.
4. Wire it into a page in `src/pages/`.

---

## Deployment

### Backend (example: Railway / Render / EC2)

```bash
# Install production server
pip install gunicorn uvicorn[standard]

# Start with multiple workers
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

> WebSockets require sticky sessions if running multiple workers behind a load balancer, since the in-memory `ConnectionManager` is per-process. For production multi-instance deployments, replace the in-memory manager with a Redis pub/sub backend.

### Frontend (example: Vercel / Netlify / S3)

```bash
cd frontend
npm run build          # outputs to dist/
# Upload dist/ to your static host
# Set VITE_API_URL and VITE_WS_URL to your production backend URLs
```

### Nginx reverse proxy (example)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/collabdocs/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend WebSocket
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;   # keep WS alive
    }
}
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** — ensure all existing tests still pass.

3. **Write tests** for any new behaviour.

4. **Run the linters** before committing:
   ```bash
   # Backend
   ruff check app/ && black app/
   # Frontend
   npm run lint
   ```

5. **Open a Pull Request** with a clear description of what you changed and why.

### Reporting bugs

Please open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behaviour
- Backend version, Python version, Node version
- Any relevant logs from the server or browser console

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using FastAPI, React, and Yjs.

</div>
