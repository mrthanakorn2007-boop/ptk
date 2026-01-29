# System Architecture

## High-Level Overview

PTK-Connext is a modular, full-stack school management system designed to provide a mobile-app-like experience on the web. It follows a **Modular Monolith** architecture.

```mermaid
graph TD
    User[User (Browser)]

    subgraph Frontend [Next.js App (apps/frontend)]
        UI[React UI (Tailwind v4)]
        State[React Query Cache]
        API_Client[Orval Generated Hooks]
        Auth_Client[Supabase SSR Client]
    end

    subgraph Backend [Hono Server (apps/backend)]
        API[Hono REST API]
        Middleware[Auth & Validation]
        Controller[Feature Modules]
        ORM[Drizzle ORM]
    end

    subgraph Infrastructure
        Supabase_Auth[Supabase Auth Service]
        Postgres[PostgreSQL Database]
        Redis[Redis (Queue/Cache)]
    end

    User --> UI
    UI --> Auth_Client
    Auth_Client --> Supabase_Auth
    UI --> API_Client
    API_Client -- "REST (with Bearer Token)" --> API
    API --> Middleware
    Middleware -- "Verify Token" --> Supabase_Auth
    Controller --> ORM
    ORM --> Postgres
```

## Core Components

### 1. Frontend Application (`apps/frontend`)
- **Framework**: Next.js 16 (App Router).
- **Styling**: Tailwind CSS v4.
- **Design Philosophy**: "Desktop-as-Mobile". The app is constrained to a mobile viewport width (`max-w-[430px]`) on desktop to simulate a native app experience.
- **Data Fetching**: Uses **Orval** to generate type-safe React Query hooks from the Backend's OpenAPI spec.
- **Authentication**: Handles login via Supabase Auth, storing the session in cookies/local storage.

For details on the frontend structure, see [Frontend Architecture](./frontend-architecture.md).

### 2. Backend Application (`apps/backend`)
- **Runtime**: Bun.
- **Framework**: Hono (optimized for performance).
- **Architecture**: Modular Monolith. Features (e.g., Students, Conduct) are encapsulated in their own modules within `src/modules/`.
- **Database Access**: **Drizzle ORM** provides type-safe SQL queries.
- **Validation**: **Zod** is used for runtime validation of all inputs and outputs, automatically generating the OpenAPI specification.

For details on the backend structure, see [Backend Architecture](./backend-architecture.md).

### 3. Database & Authentication (Supabase)
- **Database**: PostgreSQL hosted by Supabase.
- **Authentication**: Supabase Auth handles user identity (Sign Up, Sign In, Password Reset).
- **Role Management**: User roles (Teacher, Student, Admin) are stored in `raw_user_meta_data` and synced to a `profiles` table in Postgres for application-level access control.

## Communication Flow

1.  **Request Initiation**: The frontend initiates an API request (e.g., `GET /conduct/me`) using a generated React Query hook.
2.  **Auth Injection**: The custom Axios instance intercepts the request and injects the current Supabase session token into the `Authorization` header.
3.  **Backend Processing**:
    - The Hono server receives the request on port 4001.
    - `authMiddleware` verifies the JWT token with Supabase.
    - If valid, the request proceeds to the specific module controller.
4.  **Data Retrieval**: The controller uses Drizzle ORM to query PostgreSQL.
5.  **Response**: The data is validated against the output Zod schema and returned to the frontend.

## Key Design Decisions

- **Code-First Documentation**: The backend API documentation (Swagger) is generated from code (Zod schemas), ensuring it never drifts from reality.
- **Type Sharing**: While we don't use a shared package for types, the **Orval** generation pipeline ensures the frontend effectively "imports" the backend's types by inspecting the OpenAPI spec.
- **Performance**: We use Bun for its fast startup and execution, and Redis for caching and background jobs (BullMQ).
