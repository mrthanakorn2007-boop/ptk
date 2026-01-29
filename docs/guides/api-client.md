# API Client & Type Safety

This guide explains how the Frontend communicates with the Backend in a type-safe manner.

## Overview

We use **[Orval](https://orval.dev/)** to automatically generate TypeScript types and React Query hooks from the Backend's OpenAPI specification. This ensures that the frontend is always in sync with the backend contract.

## Workflow

1.  **Backend Definition**:
    - API endpoints are defined in Hono using `@hono/zod-openapi`.
    - Zod schemas define the Request (Body/Query) and Response structures.
    - The backend exposes an OpenAPI JSON spec at `http://localhost:4001/doc`.

2.  **Generation**:
    - When you run the generation command, Orval fetches the JSON spec.
    - It generates TypeScript interfaces (e.g., `Student`, `ConductLog`).
    - It generates React Query hooks (e.g., `useGetStudents`, `useCreateConductLog`).

## How to Generate

1.  **Start the Backend**: The backend must be running to serve the spec.
    ```bash
    bun run dev --filter @ptk-connext/backend
    ```

2.  **Run Generator**: In a new terminal:
    ```bash
    bun run generate-api
    # Or from the frontend directory:
    # cd apps/frontend && bun generate-api
    ```

    This command runs `orval` using the configuration in `apps/frontend/orval.config.ts`.

3.  **Output**:
    - Files are generated in `apps/frontend/src/lib/api/generated/`.
    - `api.ts`: Contains the hooks and fetch functions.
    - `model/`: Contains the TypeScript interfaces.

## Usage in Components

Using the generated hooks provides full type safety and automatic caching.

```tsx
import { useGetStudents } from '@/lib/api/generated/api'

export function StudentList() {
  // data is typed as StudentResponse
  // isLoading, error are standard React Query states
  const { data, isLoading, error } = useGetStudents({
    page: 1,
    limit: 10
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {data?.students.map(student => (
        <li key={student.id}>{student.name}</li>
      ))}
    </ul>
  )
}
```

## Underlying Configuration

### Axios Instance
The generated code uses a custom Axios instance defined in `apps/frontend/src/lib/api/axios-instance.ts`.

- **Base URL**: Defaults to `http://localhost:4001` or `NEXT_PUBLIC_API_URL`.
- **Interceptors**: Automatically injects the Supabase Access Token from the current session into the `Authorization` header.

### Manual API Calls
While Orval is preferred, you can write manual API calls (e.g., for complex edge cases) using the exported `customInstance`.

```typescript
import { customInstance } from '@/lib/api/axios-instance'

const result = await customInstance<MyResponse>('/some/custom/endpoint', {
  method: 'POST',
  data: payload
})
```

**Note**: For the Conduct Score feature, you might see manual files like `conduct.ts`. These were created before full Orval adoption. For new features, please use the generator.
