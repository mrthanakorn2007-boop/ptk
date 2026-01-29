# PTK Connext (Frontend)

This is the frontend repository for the PTK Connext School Management System. It is built with **Next.js 16**, **Tailwind CSS v4**, and uses **Supabase** for authentication.

## Documentation

- [Architecture](./docs/architecture.md)
- [Development Guides](./docs/development-guides.md)
- [Configuration & White-Labeling](./docs/configuration.md)
- [Styling](./docs/styling.md)

## Prerequisites

- **Bun** (Required package manager)
- **Backend Service** (Running on port `4001` or configured via `NEXT_PUBLIC_API_URL`)

## Installation

1.  **Install dependencies:**

    ```bash
    bun install
    ```

2.  **Configure Environment Variables:**
    Copy `.env.example` to `.env.local` and configure your Supabase and Backend URLs.

    ```bash
    cp .env.example .env.local
    ```

## Development

### Running the Server

Start the development server:

```bash
bun dev
```

The application will be available at `http://localhost:3000`.

### Generating the API Client

This project uses **Orval** to generate React Query hooks from the backend's OpenAPI specification.
**Note:** The backend service must be running for this command to work.

```bash
bun generate-api
```

This will fetch the schema from `http://localhost:4001/doc` (or your configured URL) and regenerate the hooks in `src/lib/api/generated/`.
