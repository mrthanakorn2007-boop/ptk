# Contributing to PTK-Connext

Welcome to the PTK-Connext project! We appreciate your interest in contributing. This guide serves as the primary entry point for all developers joining the team.

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Monorepo Structure](#monorepo-structure)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Development Workflow](#development-workflow)
- [How to Maintain Documentation](#how-to-maintain-documentation)
- [Code Standards](#code-standards)

---

## Project Overview

PTK-Connext is a modular school management system built with performance and scalability in mind.

- **Frontend**: Next.js 16 (React) with Tailwind CSS v4 and Supabase Auth.
- **Backend**: Hono (running on Bun) with Drizzle ORM and PostgreSQL.
- **Infrastructure**: Docker for local DB/Redis, Turborepo for task orchestration.

## Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** (v1.0+): The runtime and package manager used throughout the project.
- **Docker**: For running PostgreSQL and Redis locally.
- **Supabase Account**: Required for Authentication and Database (or use local Docker equivalent).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Pathumlnw/PTK-Connext.git
    cd PTK-Connext
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Environment Setup:**
    - Copy `.env.example` to `.env` in `apps/backend` and `apps/frontend` (if available) or root.
    - Configure your `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`.

4.  **Start Development Servers:**
    ```bash
    bun run dev
    ```
    This command starts both the frontend (localhost:3000) and backend (localhost:4001) in parallel using Turbo.

## Monorepo Structure

We use **Turborepo** to manage the workspace.

```
.
├── apps/
│   ├── backend/    # Hono API Server
│   └── frontend/   # Next.js Application
├── docs/           # Centralized Documentation
└── packages/       # Shared internal packages (if any)
```

## Frontend Development

The frontend is a **Next.js 16** application designed to simulate a mobile app experience on desktop.

- **Location**: `apps/frontend`
- **Port**: 3000
- **Key Tech**: Next.js App Router, Tailwind v4, React Query, Orval (API Client).

### Key Commands

```bash
# Run Frontend Only
bun run dev --filter @ptk-connext/frontend

# Generate API Client (Orval)
# Note: Backend must be running on port 4001
bun run generate-api
```

## Backend Development

The backend is a **Hono** server optimized for speed, running on the **Bun** runtime.

- **Location**: `apps/backend`
- **Port**: 4001
- **Key Tech**: Hono, Drizzle ORM, Zod, BullMQ.

### Key Commands

```bash
# Run Backend Only
bun run dev --filter @ptk-connext/backend

# Database Migrations (Drizzle)
bun x drizzle-kit push

# Seed Database
bun run seed
```

## Development Workflow

### Branching Strategy

- **`feature/name`**: New features (e.g., `feature/conduct-score`)
- **`fix/issue`**: Bug fixes (e.g., `fix/login-error`)
- **`docs/topic`**: Documentation updates
- **`chore/task`**: Maintenance (dependencies, config)

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add conduct score api`
- `fix: resolve auth token expiration`
- `docs: update system architecture`

## How to Maintain Documentation

**This section is crucial.** To prevent documentation from becoming disorganized or outdated, all contributors must adhere to these standards:

1.  **Single Source of Truth**:
    - All documentation lives in the `/docs` folder at the root.
    - Do not create `docs/` folders inside `apps/backend` or `apps/frontend` unless they are auto-generated build artifacts.

2.  **Folder Structure**:
    - `docs/architecture/`: High-level system design, data flows, and tech stack decisions.
    - `docs/features/`: Functional documentation for specific features (e.g., Conduct Score, Student Profile).
    - `docs/guides/`: "How-to" guides for setup, deployment, debugging, and migration.

3.  **File Naming**:
    - Use `UPPER_CASE.md` for major root files (e.g., `README.md`, `CONTRIBUTING.md`).
    - Use `kebab-case.md` for all content files (e.g., `system-architecture.md`, `student-import.md`).

4.  **Update Rule**:
    - **Code Changes = Docs Changes**. If you modify an API endpoint, update the Swagger docs (via Zod) and any relevant guides.
    - If you add a new feature, create a corresponding file in `docs/features/`.

5.  **Review Process**:
    - Pull Requests that change logic must check if docs need updating.
    - Reviewers should flag missing documentation updates before approving.

## Code Standards

- **TypeScript**: Strict mode is enabled. No `any` types allowed.
- **Linting**: Run `bun run lint` before committing.
- **Formatting**: We use Prettier/EditorConfig standards.

---

**Happy Coding!**
