# API Development Guide

This guide explains how to add new API endpoints and modules to the PTK Connext Backend.

## Workflow Summary
1.  **Design**: Define your data schema and API contract.
2.  **Module**: Create a new directory in `src/modules/`.
3.  **Components**: Separate your code into Controller, Service, and Schema.
4.  **Register**: Add the module to `src/index.ts`.

## Creating a New Module

### 1. Folder Structure
Create a new folder for your feature (e.g., `library`) with the following files:
```bash
src/modules/library/
├── library.controller.ts  # Route definitions & HTTP handling
├── library.service.ts     # Business logic & Database calls
└── library.schema.ts      # Zod schemas for Request/Response
```

### 2. Defining Schemas (`library.schema.ts`)
Define Zod schemas for your data models. This ensures consistency between validation and documentation.

```typescript
import { z } from '@hono/zod-openapi'

export const BookSchema = z.object({
  id: z.string().openapi({ example: 'ck...' }),
  title: z.string().openapi({ example: 'The Hobbit' }),
  author: z.string().openapi({ example: 'J.R.R. Tolkien' })
})
```

### 3. Implementing Service Logic (`library.service.ts`)
Keep business logic separate from the HTTP layer.

```typescript
import { db } from '../../db'
// import schema tables...

export const getAllBooks = async () => {
  // Database logic here
  return [{ id: '1', title: 'The Hobbit', author: 'J.R.R. Tolkien' }]
}
```

### 4. Defining Routes (`library.controller.ts`)
Use `OpenAPIHono` to wire everything together.

```typescript
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import * as service from './library.service'
import { BookSchema } from './library.schema'

const app = new OpenAPIHono()

const getBooksRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Library'],
  summary: 'List all books',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(BookSchema)
        }
      },
      description: 'List of books'
    }
  }
})

app.openapi(getBooksRoute, async (c) => {
  const books = await service.getAllBooks()
  return c.json(books)
})

export default app
```

### 5. Registering the Module
Open `src/index.ts` and mount your new module.

```typescript
import library from './modules/library/library.controller'

// ...
// Protected Routes (if auth is needed)
app.use('/library/*', authMiddleware)

// Mount the route
app.route('/library', library)
```

## Validation
Always use **Zod** schemas for inputs (params, query, body) and outputs.
- `request.params`: URL parameters (e.g., `/:id`).
- `request.query`: Query strings (e.g., `?page=1`).
- `request.body`: JSON body content.

## Error Handling
The application has a global error handler. If you throw an error or if Zod validation fails, the API will automatically return a structured error response.

## Testing Your Endpoints
Once registered, start the server (`bun run dev`) and visit:
- **Interactive UI**: `http://localhost:4001/reference`
- **OpenAPI JSON**: `http://localhost:4001/doc`

You can test your new endpoints directly from the Scalar UI at `/reference`.
