# Project Architecture

## Overview
This project is a **White-Labeled School Management System** (currently configured as "PTK Connext"). It is built using **Next.js 16** and designed to provide a **mobile-app-like experience** directly in the web browser.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Runtime/Package Manager:** Bun
- **Icons:** Lucide React, React Icons
- **Animations:** Framer Motion (used for 3D card flips and complex interactions)
- **UI Components:** Manual implementation of shadcn/ui patterns (Radix UI primitives + Tailwind)
- **API Client:** Orval (Generates React Query hooks from OpenAPI)
- **State/Data Management:** TanStack Query (React Query)
- **Authentication:** Supabase Auth

## Mobile Simulation Layout
A key architectural decision is the **Desktop-as-Mobile** layout.

- **Constraint:** The application runs inside a centered container with a maximum width of `430px` and a minimum height of `100vh`.
- **Background:** On desktop screens, the body has a dot-grid background, and the app "phone" floats in the center with a shadow.
- **Responsiveness:** On actual mobile devices, the container takes up the full width (100%).
- **Implementation:** This logic is primarily handled in `src/app/layout.tsx`.

### Important Rules for Developers
1. **Modals & Overlays:** Must also adhere to the `max-w-[430px]` constraint to match the parent container.
2. **Background Colors:** Page-level components should **avoid** defining opaque backgrounds (e.g., `bg-white`) on their top-level wrappers unless intended to cover the entire "screen".
3. **Scroll:** The main scrollable area is within the `max-w-[430px]` container.

## Folder Structure (`src/`)

```
src/
├── app/                 # Next.js App Router
│   ├── dashboard/       # Main dashboard view
│   ├── features/        # Feature sub-pages (e.g., /features/conduct)
│   ├── globals.css      # Global styles & Tailwind v4 theme
│   └── layout.tsx       # Root layout (Mobile simulation wrapper)
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   ├── features/        # Feature-specific components
│   ├── layout/          # Global layout components (Nav, Footer)
│   ├── ui/              # Reusable UI components (Buttons, Inputs, etc.)
│   └── feature-header.tsx # Standard header for feature pages
├── data/                # Mock JSON data & Configuration
│   ├── school-config.json # White-labeling settings
│   └── *.json           # Mock database tables (deprecated/fallback)
└── lib/                 # Utility functions
    ├── api/             # Generated API client (Orval)
    └── supabase/        # Supabase client & middleware
```

## Data Flow
The application uses a hybrid approach with **Supabase** and a **Custom Backend**.

- **Authentication:** Managed by **Supabase**. The frontend uses the Supabase client to handle sessions and retrieve access tokens.
- **API Logic:** A custom backend (defaulting to port `4001`) handles business logic and data persistence.
- **Data Fetching:** The frontend generates type-safe React Query hooks from the backend's OpenAPI specification using **Orval**.
- **Authorization:** Requests to the custom backend automatically include the Supabase access token in the `Authorization` header (`Bearer <token>`) via the axios interceptor.
