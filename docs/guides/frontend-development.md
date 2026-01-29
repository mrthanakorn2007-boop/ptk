# Development Guides

This document contains step-by-step guides for common development tasks.

## 1. How to Add a New Feature Page

Feature pages (e.g., Conduct Score, Student Profile) live under `src/app/features/`.

### Step-by-Step
1.  **Create the Route:**
    Create a new folder in `src/app/features/` with the feature name (e.g., `my-feature`).
    Add a `page.tsx` file inside it.

    ```tsx
    // src/app/features/my-feature/page.tsx
    import { FeatureHeader } from "@/components/feature-header";

    export default function MyFeaturePage() {
      return (
        <main className="min-h-screen bg-[#F5F6FA] pb-6">
          <FeatureHeader
            title="My Feature"
            backHref="/dashboard"
          />
          <div className="px-4 pt-20">
            {/* Content goes here */}
          </div>
        </main>
      );
    }
    ```

2.  **Use `FeatureHeader`:**
    Always use the `FeatureHeader` component. It provides the standard "glassmorphism" look and back navigation.
    - `title`: The name of the feature (Thai preferred for UI).
    - `backHref`: Usually `/dashboard` or the parent page.

3.  **Add to Dashboard (Optional):**
    If this is a main feature, add a link card in `src/app/dashboard/page.tsx` (or the relevant component).

## 2. How to Create a Modal/Overlay

Because this app simulates a mobile device on desktop, **modals cannot be full-screen**. They must be constrained to the "phone" container.

### The Rule
**DO NOT** use `w-screen h-screen fixed inset-0`.
**INSTEAD USE** `absolute inset-0 z-50` inside the main layout wrapper, OR ensure your fixed overlay has `max-w-[430px]` and is centered.

### Recommended Pattern (Radix UI / Manual)
If using a Portal, ensure the portal target is within the main application container (conceptually), or manually apply the style:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div className="w-full max-w-[430px] rounded-xl bg-white p-4">
     {/* Modal Content */}
  </div>
</div>
```

## 3. Working with the API

We use **Orval** to generate type-safe React Query hooks from the backend's OpenAPI specification.

### Prerequisites
- The backend service must be running (default: `localhost:4001`).
- The backend must expose its OpenAPI spec (usually at `/doc` or `/swagger-json`).

### Generating Hooks
Whenever the backend API changes, you need to regenerate the frontend hooks.

```bash
bun generate-api
```

This command will:
1.  Fetch the OpenAPI spec from `http://localhost:4001/doc` (configurable in `orval.config.ts`).
2.  Generate TypeScript interfaces and React Query hooks in `src/lib/api/generated/`.

### Using the Generated Hooks
Orval generates custom hooks that you can use directly in your components.

```tsx
"use client";

import { useGetStudentProfile } from "@/lib/api/generated/api";

export default function ProfilePage() {
  const { data, isLoading, error } = useGetStudentProfile(studentId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return (
    <div>
      <h1>{data?.firstName} {data?.lastName}</h1>
    </div>
  );
}
```
