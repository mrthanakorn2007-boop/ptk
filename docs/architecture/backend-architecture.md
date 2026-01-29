# System Architecture

## Overview
PTK Connext Backend is a high-performance REST API built to serve the digital learning and management system for Pathumthep Wittayakarn School. It provides endpoints for student information, schedules, academic records, and notifications.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - A fast all-in-one JavaScript runtime.
- **Framework**: [Hono](https://hono.dev) - A lightweight, ultra-fast web standard framework.
- **Database**: PostgreSQL (via Supabase).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM for SQL databases.
- **Validation**: [Zod](https://zod.dev) - TypeScript-first schema declaration and validation.
- **Documentation**: OpenAPI (Swagger) via `@hono/zod-openapi` and Scalar UI.
- **Authentication**: Supabase Auth (JWT).
- **Job Queue**: BullMQ with Redis.

## Project Structure

The project follows a **Modular Monolith** architecture to keep concerns separated and maintainable.

```
src/
├── config/         # App-wide configuration (env, redis, school config)
│   ├── env.ts           # Environment variable validation
│   ├── redis.ts         # Redis connection
│   └── school.config.ts # School-specific configuration
├── db/             # Database schema and connection setup
│   ├── index.ts         # Shared database connection
│   └── schema.ts        # Drizzle schema definitions
├── libs/           # External service clients
│   └── supabase.ts      # Supabase client
├── middlewares/    # Global middlewares
│   ├── auth.ts          # JWT authentication
│   ├── error.ts         # Global error handler
│   └── rate-limit.ts    # Rate limiting with Redis
├── modules/        # Feature-based modules
│   └── students/        # Student management
│       ├── students.controller.ts
│       └── students.schema.ts
├── templates/      # HTML templates
│   └── landing.ts       # Landing page with API endpoints
├── utils/          # Helper functions
│   ├── encryption.ts    # AES-256-GCM encryption utilities
│   └── queue/           # Background job queues
│       └── notifications.queue.ts
└── index.ts        # Entry point and app composition
```

## Key Architectural Decisions

### 1. Modular Design
Each feature is encapsulated in its own directory under `src/modules/`. This allows for better scalability. If a feature needs to be extracted into a microservice in the future, it is self-contained.

### 2. Type Safety
We use TypeScript strictly. Drizzle ORM provides type-safe database queries, and Zod ensures runtime validation of API requests and responses. This minimizes runtime errors.

### 3. API Documentation
We use a "Code-First" approach for documentation. The OpenAPI specification is generated automatically from the Zod schemas used in the routes. This ensures the documentation (`/doc` and `/reference`) is always in sync with the code.

### 4. Database Schema
We use `CUID2` for primary keys instead of auto-incrementing integers to ensure collision-resistant IDs that are safe for distributed systems.

### 5. Performance
- **Bun**: Chosen for its fast startup and execution time.
- **Hono**: Chosen for its minimal overhead.
- **Redis**: Used for caching and job queues (BullMQ).
