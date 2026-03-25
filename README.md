# 📝 CollabDocs - Real-Time Collaborative Document Editor

<div align="center">

![CollabDocs Banner](https://img.shields.io/badge/CollabDocs-Real--Time%20Editor-1a73e8?style=for-the-badge&logo=googledocs&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT%20Sync-orange?style=flat-square)](https://yjs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A production-ready Google Docs alternative with real-time collaboration, version history, threaded comments, and granular permissions.**

[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Demo](#demo) · [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [WebSocket Protocol](#websocket-protocol)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Permissions & Roles](#permissions--roles)
- [Real-Time Collaboration](#real-time-collaboration)
- [Version History](#version-history)
- [Comments System](#comments-system)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**CollabDocs** is a full-stack, real-time collaborative document editor inspired by Google Docs. Multiple users can edit the same document simultaneously, see each other's cursors, leave threaded comments, and restore previous versions — all without conflicts, thanks to **Yjs CRDT** (Conflict-free Replicated Data Type) synchronization over WebSockets.

### Why This Project?

- ✅ **Learn Modern Full-Stack Development** - FastAPI, React, WebSockets, PostgreSQL
- ✅ **Understand CRDTs** - How real-time collaboration works under the hood
- ✅ **Production-Ready Architecture** - Layered design with repositories, services, and proper error handling
- ✅ **Complete Feature Set** - Auth, permissions, versions, comments, and real-time sync

---

## ✨ Features

| Category | Features |
|----------|----------|
| **📝 Editor** | Rich-text editing (headings, bold, italic, lists, links) via Quill.js |
| **👥 Collaboration** | Real-time multi-user editing with CRDT conflict resolution (Yjs) |
| **🖱️ Presence** | Live cursor positions and user avatars for active collaborators |
| **💾 Persistence** | Auto-save to PostgreSQL every 2 seconds after user activity stops |
| **📶 Offline** | Offline-first — Yjs buffers changes locally and syncs on reconnect |
| **🔐 Authentication** | JWT-based register/login; stateless, no session store needed |
| **👑 Permissions** | Three-tier RBAC: Owner, Editor, Viewer per document |
| **🔗 Sharing** | Share any document with any registered user by email |
| **📚 Version History** | Full version history; create named snapshots; one-click restore |
| **💬 Comments** | Threaded comments anchored to text selections; resolve/unresolve |
| **🎨 UI** | Material UI, responsive layout, light/dark-mode ready |

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **FastAPI** | Async REST API + WebSocket endpoints |
| Language | **Python 3.11+** | |
| ORM | **SQLAlchemy 2.x** (async) | Database models and queries |
| Database | **PostgreSQL 15+** | Persistent storage |
| Auth | **python-jose** + **passlib** | JWT creation/verification, bcrypt hashing |
| Validation | **Pydantic v2** | Request/response schemas |
| Migrations | **Alembic** | Schema migrations (production) |
| Driver | **asyncpg** | Async PostgreSQL driver |

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **React 18** | UI components |
| Build tool | **Vite** | Fast dev server + bundler |
| Editor | **Quill.js** | Rich-text editing engine |
| CRDT Sync | **Yjs** + **y-websocket** | Real-time conflict-free sync |
| Quill ↔ Yjs | **y-quill** | Binding between Quill and Yjs |
| UI Library | **MUI (Material UI) v5** | Component library |
| HTTP Client | **Axios** | REST API calls |
| State | **Zustand** | Lightweight global state |
| Routing | **React Router v6** | Client-side routing |
| Dates | **date-fns** | Human-readable timestamps |
| Toasts | **react-hot-toast** | Notifications |

---

## 🏗️ Architecture

### System Diagram
