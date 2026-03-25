📝 CollabDocs - Real-Time Collaborative Document Editor
<div align="center">
https://img.shields.io/badge/CollabDocs-Real--Time%2520Editor-1a73e8?style=for-the-badge&logo=googledocs&logoColor=white

https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white
https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black
https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white
https://img.shields.io/badge/Yjs-CRDT%2520Sync-orange?style=flat-square
https://img.shields.io/badge/License-MIT-yellow?style=flat-square

A production-ready Google Docs alternative with real-time collaboration, version history, threaded comments, and granular permissions.

Features · Architecture · Quick Start · API Reference · Demo · Contributing

</div>
📋 Table of Contents
Overview

Features

Tech Stack

Architecture

Database Schema

API Reference

WebSocket Protocol

Quick Start

Environment Variables

Authentication Flow

Permissions & Roles

Real-Time Collaboration

Version History

Comments System

Security

Deployment

Troubleshooting

Contributing

License

🎯 Overview
CollabDocs is a full-stack, real-time collaborative document editor inspired by Google Docs. Multiple users can edit the same document simultaneously, see each other's cursors, leave threaded comments, and restore previous versions — all without conflicts, thanks to Yjs CRDT (Conflict-free Replicated Data Type) synchronization over WebSockets.

Why This Project?
✅ Learn Modern Full-Stack Development - FastAPI, React, WebSockets, PostgreSQL

✅ Understand CRDTs - How real-time collaboration works under the hood

✅ Production-Ready Architecture - Layered design with repositories, services, and proper error handling

✅ Complete Feature Set - Auth, permissions, versions, comments, and real-time sync

✨ Features
Category	Features
📝 Editor	Rich-text editing (headings, bold, italic, lists, links) via Quill.js
👥 Collaboration	Real-time multi-user editing with CRDT conflict resolution (Yjs)
🖱️ Presence	Live cursor positions and user avatars for active collaborators
💾 Persistence	Auto-save to PostgreSQL every 2 seconds after user activity stops
📶 Offline	Offline-first — Yjs buffers changes locally and syncs on reconnect
🔐 Authentication	JWT-based register/login; stateless, no session store needed
👑 Permissions	Three-tier RBAC: Owner, Editor, Viewer per document
🔗 Sharing	Share any document with any registered user by email
📚 Version History	Full version history; create named snapshots; one-click restore
💬 Comments	Threaded comments anchored to text selections; resolve/unresolve
🎨 UI	Material UI, responsive layout, light/dark-mode ready
🛠️ Tech Stack
Backend
Layer	Technology	Purpose
Framework	FastAPI	Async REST API + WebSocket endpoints
Language	Python 3.11+	
ORM	SQLAlchemy 2.x (async)	Database models and queries
Database	PostgreSQL 15+	Persistent storage
Auth	python-jose + passlib	JWT creation/verification, bcrypt hashing
Validation	Pydantic v2	Request/response schemas
Migrations	Alembic	Schema migrations (production)
Driver	asyncpg	Async PostgreSQL driver
Frontend
Layer	Technology	Purpose
Framework	React 18	UI components
Build tool	Vite	Fast dev server + bundler
Editor	Quill.js	Rich-text editing engine
CRDT Sync	Yjs + y-websocket	Real-time conflict-free sync
Quill ↔ Yjs	y-quill	Binding between Quill and Yjs
UI Library	MUI (Material UI) v5	Component library
HTTP Client	Axios	REST API calls
State	Zustand	Lightweight global state
Routing	React Router v6	Client-side routing
Dates	date-fns	Human-readable timestamps
Toasts	react-hot-toast	Notifications
🏗️ Architecture
System Diagram
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
                              │                                    │
                              └────────────────────────────────────┘
```
Project Structure
```
collabdocs/
├── backend/                        # FastAPI application
│   ├── app/
│   │   ├── main.py                 # App factory, middleware, router registration
│   │   ├── core/                   # Configuration, security, database
│   │   │   ├── config.py           # Pydantic settings (reads .env)
│   │   │   ├── database.py         # Async SQLAlchemy engine + session factory
│   │   │   ├── security.py         # JWT encode/decode, bcrypt helpers
│   │   │   └── exceptions.py       # Custom HTTP exception classes
│   │   ├── models/                 # SQLAlchemy ORM models (6 tables)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── repositories/           # Database access layer (CRUD)
│   │   ├── services/               # Business logic layer
│   │   └── api/
│   │       ├── dependencies.py     # get_current_user, get_optional_user
│   │       ├── middleware/         # Auth + logging middleware
│   │       └── v1/
│   │           ├── endpoints/      # REST endpoints (auth, docs, permissions, etc.)
│   │           └── websocket/      # WebSocket endpoint for Yjs sync
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/                       # React + Vite SPA
    ├── src/
    │   ├── main.jsx                # React root, ThemeProvider, Router, Toaster
    │   ├── App.jsx                 # Route declarations
    │   ├── assets/                 # Theme, global CSS
    │   ├── pages/                  # Login, Register, Dashboard, DocumentEditor
    │   ├── components/             # Reusable components (editor, comments, versions)
    │   ├── store/                  # Zustand stores (auth, document, comment, presence)
    │   ├── services/               # Axios API wrappers
    │   ├── hooks/                  # Custom React hooks
    │   ├── routes/                 # ProtectedRoute component
    │   └── utils/                  # Constants, validators, helpers
    ├── .env.example
    └── vite.config.js
```
🗄️ Database Schema
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
Key Design Decisions
Table	Purpose	Design Choice
documents.content	Document content	Stored as JSON (Quill Delta) — preserves rich-text formatting natively; avoids HTML sanitization
permissions	User roles	Unique constraint on (document_id, user_id) ensures one role per user per document
operations	CRDT audit trail	Stores raw Yjs binary updates for potential replay/audit (not used in main sync path)
versions	Snapshots	Auto-incrementing version_number per document; UNIQUE(document_id, version_number)
comments	Threaded discussions	parent_id self-referential FK enables threading; selection JSON anchors comments to text
📡 API Reference
Base URL: http://localhost:8000/api/v1

All endpoints except /auth/login and /auth/register require:

```
Authorization: Bearer <access_token>
```
🔐 Authentication
Method	Endpoint	Body	Response	Description
POST	/auth/register	UserCreate	Token	Create account + return JWT
POST	/auth/login	OAuth2PasswordRequestForm	Token	Login + return JWT
GET	/auth/me	—	UserResponse	Current user info
UserCreate Example:

```json
{
  "email": "alice@example.com",
  "username": "alice",
  "full_name": "Alice Smith",
  "password": "supersecret123"
}
```
Token Response:

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
📄 Documents
Method	Endpoint	Query	Response	Description
GET	/documents/	skip, limit	DocumentListResponse[]	List your documents
POST	/documents/	—	DocumentResponse	Create a document
GET	/documents/{id}	—	DocumentResponse	Get a document
PUT	/documents/{id}	—	DocumentResponse	Update title / content / visibility
DELETE	/documents/{id}	—	204	Delete (owner only)
POST	/documents/{id}/share	—	{message}	Share with a user
DocumentResponse Example:

```json
{
  "id": "550e8400-...",
  "title": "My First Doc",
  "content": { "ops": [{ "insert": "Hello world\n" }] },
  "owner_id": "...",
  "is_public": false,
  "last_edited_at": "2024-01-15T10:35:00Z",
  "created_at": "2024-01-15T10:30:00Z"
}
```
👥 Permissions
Method	Endpoint	Response	Description
GET	/permissions/document/{id}	PermissionResponse[]	List all permissions on a document
POST	/permissions/	PermissionResponse	Grant a permission
DELETE	/permissions/{id}	204	Revoke a permission
GET	/permissions/check/{doc_id}?required_role=editor	{has_permission}	Check your access level
📚 Versions
Method	Endpoint	Query	Response	Description
GET	/versions/document/{id}	—	VersionResponse[]	All versions, newest first
POST	/versions/document/{id}	comment (optional)	VersionResponse	Snapshot current content
GET	/versions/{version_id}	—	VersionResponse	Get a specific version
POST	/versions/{version_id}/restore	document_id	VersionResponse	Restore + create new snapshot
💬 Comments
Method	Endpoint	Response	Description
GET	/comments/document/{id}	CommentResponse[]	All comments on a document
POST	/comments/	CommentResponse	Add a comment
PUT	/comments/{id}	CommentResponse	Edit your comment
DELETE	/comments/{id}	204	Delete your comment
POST	/comments/{id}/resolve	CommentResponse	Resolve a comment
CommentCreate Example:

```json
{
  "document_id": "550e8400-...",
  "content": "This paragraph needs more detail.",
  "selection": { "text": "selected text", "index": 42, "length": 13 },
  "parent_id": null
}
```
🔌 WebSocket Protocol
Endpoint: ws://localhost:8000/ws/{document_id}?token=<jwt>

The WebSocket layer carries only binary Yjs messages. No JSON is sent over this connection.

Connection Flow
```
Client                                  Server
  │                                       │
  │-- GET /ws/{doc_id}?token=... -------->│
  │<- 101 Switching Protocols ----------│
  │                                       │  Auth check (JWT + DB permission)
  │                                       │  Connect to in-memory room
  │-- [Yjs sync step 1 binary] ---------->│
  │<- [Yjs sync step 2 binary] ---------│
  │<- [Yjs awareness states] -----------│  (other users' cursors/colors)
  │                                       │
  │-- [Yjs update: user typed] ---------->│  broadcast to all other clients
  │<- [Yjs update: other user] ---------│
  │                                       │
  │-- websocket.disconnect -------------->│  room cleanup
```
Authentication Over WebSocket
JWT is passed as a query parameter (?token=...) because browsers cannot set Authorization headers on WebSocket upgrades. The token is validated server-side before the connection is accepted into a room.

Yjs Awareness (Presence)
Each client's y-websocket provider broadcasts an awareness state containing:

```javascript
{
  user: {
    id: "uuid",
    name: "alice",
    color: "hsl(240, 70%, 60%)"   // deterministic from user id
  }
}
```
This powers the live presence avatars shown in the document toolbar.

🚀 Quick Start
Prerequisites
Python 3.11+

Node.js 18+

PostgreSQL 15+ running locally (or via Docker)

Backend Setup
```bash
# 1. Clone the repository
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
The API will be available at http://localhost:8000.
Interactive docs: http://localhost:8000/docs

Frontend Setup
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
The app will be available at http://localhost:3000.

Docker Compose (Optional)
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
🔧 Environment Variables
Backend (.env)
Variable	Required	Default	Description
SECRET_KEY	✅	—	256-bit random hex string for JWT signing. Generate with python -c "import secrets; print(secrets.token_hex(32))"
ALGORITHM	❌	HS256	JWT signing algorithm
ACCESS_TOKEN_EXPIRE_MINUTES	❌	60	JWT lifetime in minutes
POSTGRES_SERVER	❌	localhost	Database host
POSTGRES_USER	❌	postgres	Database user
POSTGRES_PASSWORD	✅	—	Database password
POSTGRES_DB	❌	editor_db	Database name
DATABASE_URL	❌	auto-built	Override the full asyncpg connection string
Frontend (.env)
Variable	Required	Default	Description
VITE_API_URL	❌	http://localhost:8000/api/v1	Backend REST base URL
VITE_WS_URL	❌	ws://localhost:8000/ws	WebSocket base URL
🔐 Authentication Flow
CollabDocs uses stateless JWT authentication.

Token Lifecycle
```
Register/Login
    ↓
Server issues signed JWT (HS256)
    ↓
Client stores token in localStorage (via Zustand persist)
    ↓
Every HTTP request: Axios interceptor reads token → sets Authorization header
    ↓
Every WS connection: token passed as ?token= query param
    ↓
Token expires after ACCESS_TOKEN_EXPIRE_MINUTES (default 60)
    ↓
On 401: Axios interceptor clears storage → redirects to /login
```
How the Server Resolves Users
AuthMiddleware decodes JWT on every HTTP request and caches user_id on request.state

get_current_user dependency reads from request.state first (cheap, no DB hit)

Falls back to re-decoding raw token from Authorization header if state isn't populated

Deactivated users (is_active=False) are rejected with 403 Forbidden even with valid JWT

👑 Permissions & Roles
Every document has exactly one owner and any number of editors/viewers.

Role	Read	Write	Share	Delete	Version	Resolve comments
Owner	✅	✅	✅	✅	✅	✅
Editor	✅	✅	❌	❌	✅	✅
Viewer	✅	❌	❌	❌	❌	❌
Rules
Only the owner can share a document or revoke permissions

The owner's own OWNER permission row cannot be revoked or downgraded

Sharing a document that a user already has access to updates their role (upsert)

Permission checks hit the DB once per request; owner_id column is checked first to avoid a join for the most common case

🔄 Real-Time Collaboration
How Yjs Works
Yjs is a CRDT library. A CRDT (Conflict-free Replicated Data Type) is a data structure designed so that concurrent edits from multiple users can always be merged without conflicts — no "last write wins" collisions.

```
User A types "Hello"    User B types "World"
Both have network lag.

Without CRDT:  "Hello" OR "World"  ← one overwrites the other
With CRDT:     "HelloWorld"        ← both changes merged deterministically
```
Components
Component	Role
Y.Doc	The shared document state. Each client has one.
ytext = ydoc.getText('quill')	The shared text type mapped to Quill's content
WebsocketProvider	Connects the Y.Doc to the server; syncs binary updates
QuillBinding	Keeps Quill's Delta and the Yjs text type in sync bidirectionally
provider.awareness	Broadcast-only channel for ephemeral state (cursors, user info)
Seeding from Database
When a user opens a document:

Yjs syncs with the server first

If server's Yjs state is empty (first user opening the doc), the client seeds the Yjs text from the database's stored Quill Delta

Subsequent users receive the already-populated Yjs state directly from the first user via the server relay

Auto-Save
Quill's text-change event fires on every keystroke

Only acts on changes where source === 'user' (ignoring Yjs-driven remote updates)

2-second debounced timer saves the current Quill Delta to the REST API → PostgreSQL

📚 Version History
Versions are explicit snapshots of a document's content at a point in time.

Creating a Version
```bash
POST /versions/document/{id}?comment=Before+major+refactor
```
This copies the current documents.content JSON into a new versions row with an auto-incremented version_number.

Restoring a Version
```bash
POST /versions/{version_id}/restore?document_id={id}
```
This:

Sets documents.content to the version's content

Creates a new version snapshot with the comment "Restored from version N" — preserving the full audit trail

Returns the new version

Note: Restoring a version updates the PostgreSQL record but does not automatically push the change to currently-connected Yjs clients. After a restore, collaborators should refresh their page to receive the restored content via the initial database seed.

💬 Comments System
Comments are threaded and can be anchored to a text selection.

Data Model
```
Comment
├── id, document_id, user_id
├── content          ← the comment text
├── selection        ← JSON: { text, index, length } — the highlighted text
├── parent_id        ← null for top-level; UUID for replies
├── resolved         ← boolean
└── created_at / updated_at
```
Threading
Top-level comments have parent_id = null

Replies set parent_id to the parent comment's ID

The API returns all comments flat; the frontend groups replies by parent_id

Cross-document parent references are rejected server-side (a reply must belong to the same document as its parent)

Resolving
Any collaborator (owner or comment author) can mark a comment resolved. Resolved comments are visually dimmed but preserved in the record.

🔒 Security
Concern	Mitigation
Password storage	bcrypt with work factor 12 (via passlib) — never stored plain
JWT signing	HS256 with a 256-bit secret key loaded from environment
Token expiry	Configurable; default 60 minutes
SQL injection	All queries use SQLAlchemy's parameterized ORM — no raw string interpolation
CORS	Explicit origin allowlist (localhost:3000); update for production
Input validation	Pydantic v2 validates all request bodies with type coercion
Permission checks	Every service method checks ownership/role before acting
Owner demotion	Server rejects attempts to downgrade or revoke the owner's own permission
Account deactivation	is_active=False blocks login and all API access even with valid token
Query limits	skip/limit params validated with ge=0, le=200 bounds
WebSocket auth	JWT verified server-side before connection is admitted to a room
Production Hardening Checklist
Set SECRET_KEY to a cryptographically random 256-bit value (never reuse dev keys)

Set ACCESS_TOKEN_EXPIRE_MINUTES to a shorter window (e.g., 30 minutes) + implement refresh tokens

Change CORS allow_origins from localhost to your actual frontend domain

Set echo=False in SQLAlchemy engine (already done in this codebase)

Run behind HTTPS (TLS termination at reverse proxy — nginx/Caddy)

Use Alembic for database migrations instead of create_all

Add rate limiting (e.g., slowapi) on /auth/login and /auth/register

Store JWTs in httpOnly cookies instead of localStorage to prevent XSS token theft

🚢 Deployment
Backend (Production)
```bash
# Install production server
pip install gunicorn uvicorn[standard]

# Start with multiple workers
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```
Note: WebSockets require sticky sessions if running multiple workers behind a load balancer, since the in-memory ConnectionManager is per-process. For production multi-instance deployments, replace the in-memory manager with a Redis pub/sub backend.

Frontend (Production)
```bash
cd frontend
npm run build          # outputs to dist/
# Upload dist/ to your static host
# Set VITE_API_URL and VITE_WS_URL to your production backend URLs
```
Nginx Reverse Proxy (Example)
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
🐛 Troubleshooting
Common Issues
Issue	Solution
CORS error	Ensure allow_origins in main.py includes your frontend URL
WebSocket connection fails	Check token is being passed in query param; verify backend logs for JWT errors
Content not saving	Check browser console for 500 errors; verify database permissions
Comments not showing	Ensure fetchComments is called with correct documentId
Version restore not working	Check that version belongs to the document; verify user has editor permissions
Multi-tab sync not working	Verify WebSocket is connected in both tabs; check backend logs for binary broadcast
Debugging
Enable detailed logs:

```python
# backend/app/core/config.py
class Settings:
    LOG_LEVEL: str = "DEBUG"  # Add this line

# backend/app/main.py
logging.basicConfig(level=settings.LOG_LEVEL)
```
Browser console:

```javascript
// Check WebSocket connection
const ws = new WebSocket('ws://localhost:8000/ws/doc-id?token=your-token');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);

// Check auth token
console.log(localStorage.getItem('auth-storage'));
```
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository and create a feature branch:

```bash
git checkout -b feature/my-new-feature
```
Make your changes — ensure all existing tests still pass

Write tests for any new behaviour

Run the linters before committing:

```bash
# Backend
ruff check app/ && black app/
# Frontend
npm run lint
```
Open a Pull Request with a clear description of what you changed and why

Reporting Bugs
Please open a GitHub Issue with:

Steps to reproduce

Expected vs actual behaviour

Backend version, Python version, Node version

Any relevant logs from the server or browser console

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

<div align="center">
Built with ❤️ using FastAPI, React, and Yjs

Report Bug · Request Feature

</div>
