# Code Quality Standards

This document outlines the code quality standards and best practices for the PTK-Connext project.

## Table of Contents

- [Overview](#overview)
- [Code Quality Tools](#code-quality-tools)
- [TypeScript Standards](#typescript-standards)
- [Code Organization](#code-organization)
- [Error Handling](#error-handling)
- [Performance Best Practices](#performance-best-practices)
- [Security Standards](#security-standards)
- [Code Review Checklist](#code-review-checklist)

## Overview

Maintaining high code quality ensures:
- Fewer bugs and issues
- Easier maintenance and refactoring
- Better collaboration among team members
- Improved security and performance
- Faster onboarding for new developers

## Code Quality Tools

### Automated Tools

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- No `any` types allowed
- All types must be explicitly defined

**ESLint:**
- Backend: Custom ESLint configuration
- Frontend: Next.js ESLint configuration
- Pre-commit hooks enforce linting

**Prettier (Optional):**
- Can be configured for consistent formatting
- Recommended for teams with multiple contributors

### Running Quality Checks

```bash
# Type checking
bun run type-check

# Linting
bun run lint

# Fix auto-fixable issues
cd apps/backend && npm run lint -- --fix
cd apps/frontend && npm run lint -- --fix
```

## TypeScript Standards

### Type Safety

**✅ Do:**
```typescript
// Explicit return types
function getUserById(id: string): Promise<User | null> {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

// Proper type definitions
interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

// Type guards
function isStudent(user: User): user is User & { role: 'student' } {
  return user.role === 'student';
}
```

**❌ Don't:**
```typescript
// Avoid any
function getData(id: string): any {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

// Implicit any
function processData(data) {
  return data.value;
}

// Type assertions without validation
const user = data as User;
```

### Null Handling

**✅ Do:**
```typescript
// Optional chaining
const userName = user?.profile?.name;

// Nullish coalescing
const displayName = user?.name ?? 'Guest';

// Explicit null checks
if (user === null || user === undefined) {
  throw new Error('User not found');
}
```

**❌ Don't:**
```typescript
// Unsafe property access
const userName = user.profile.name;  // May throw if user is null

// Implicit truthy checks (when null/undefined matters)
if (user) {  // What about false, 0, ''?
  // ...
}
```

### Type Imports

**✅ Do:**
```typescript
import type { User } from '@supabase/supabase-js';
import type { Context } from 'hono';
import { db } from './db';
```

**❌ Don't:**
```typescript
import { User, Context } from 'some-library';  // Mixing types and values
```

## Code Organization

### File Structure

**Single Responsibility:**
- Each file should have one primary purpose
- Keep files under 300 lines when possible
- Extract reusable logic into utility functions

**Module Organization:**
```typescript
// ✅ Good: Separated concerns
// user.controller.ts
export const userController = new Hono()
  .get('/', listUsers)
  .post('/', createUser);

// user.schema.ts
export const UserSchema = z.object({ ... });

// user.service.ts
export class UserService {
  async findById(id: string) { ... }
}
```

### Function Size

- Keep functions under 50 lines
- Extract complex logic into helper functions
- Use descriptive function names

**✅ Do:**
```typescript
// Small, focused functions
async function validateUser(user: User): Promise<ValidationResult> {
  const emailValid = validateEmail(user.email);
  const passwordValid = validatePassword(user.password);
  return { emailValid, passwordValid };
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**❌ Don't:**
```typescript
// Large, monolithic function
async function processUserRegistration(data: any) {
  // 200+ lines of mixed validation, database operations, email sending, etc.
}
```

### Variable Naming

**✅ Do:**
```typescript
// Descriptive names
const maxRetryAttempts = 3;
const isUserAuthenticated = true;
const studentRecords = await getStudentRecords();

// Boolean prefixes
const hasPermission = checkPermission(user);
const isValid = validateInput(data);
const shouldUpdate = needsUpdate(record);
```

**❌ Don't:**
```typescript
// Vague names
const data = getData();
const temp = processTemp();
const x = calculate();

// Misleading names
const flag = true;  // What flag?
const status = 1;   // What status?
```

## Error Handling

### Error Handling Patterns

**✅ Do:**
```typescript
// Specific error types
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Proper error handling
try {
  const result = await riskyOperation();
  return c.json({ success: true, data: result }, 200);
} catch (error) {
  if (error instanceof ValidationError) {
    return c.json({ error: error.message, field: error.field }, 400);
  }
  
  console.error('[Module] Unexpected error:', error);
  return c.json({ error: 'Operation failed' }, 500);
}
```

**❌ Don't:**
```typescript
// Silent failures
try {
  await riskyOperation();
} catch (error) {
  // Nothing - error is swallowed
}

// Exposing internal errors
try {
  await riskyOperation();
} catch (error) {
  return c.json({ error: error.stack }, 500);  // Exposes stack trace
}

// Using any for errors
catch (error: any) {
  return error.message;
}
```

### Logging Standards

**✅ Do:**
```typescript
// Structured logging
console.log('[Auth] Login attempt:', { 
  userId: user.id, 
  timestamp: new Date().toISOString() 
});

console.error('[Database] Query failed:', {
  query: 'SELECT ...',
  error: error.message,
  timestamp: new Date().toISOString()
});
```

**❌ Don't:**
```typescript
// Unstructured logging
console.log('Login');
console.log('Error:', error);

// Logging sensitive data
console.log('User password:', password);  // Never log passwords
console.log('Token:', token);  // Never log tokens
```

## Performance Best Practices

### Database Queries

**✅ Do:**
```typescript
// Select only needed fields
const users = await db
  .select({ id: users.id, name: users.name })
  .from(users)
  .where(eq(users.active, true));

// Use pagination
const results = await db
  .select()
  .from(users)
  .limit(50)
  .offset(page * 50);

// Use indexes for frequently queried fields
await db.execute(sql`
  CREATE INDEX idx_users_email ON users(email);
`);
```

**❌ Don't:**
```typescript
// Select all fields when not needed
const users = await db.select().from(users);

// N+1 queries
for (const user of users) {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id)
  });
}

// Missing pagination
const allUsers = await db.select().from(users);  // Could be millions
```

### React Performance

**✅ Do:**
```typescript
// Memoize expensive computations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

**❌ Don't:**
```typescript
// Inline object creation in props
<Component config={{ value: 1, name: 'test' }} />  // New object every render

// Inline function creation in props
<Component onClick={() => handleClick()} />  // New function every render

// Missing dependencies in hooks
useEffect(() => {
  fetchData(userId);
}, []);  // Missing userId dependency
```

## Security Standards

### Input Validation

**✅ Do:**
```typescript
// Validate all inputs with Zod
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validateInput = (data: unknown) => {
  return LoginSchema.parse(data);
};

// Sanitize HTML input
import DOMPurify from 'isomorphic-dompurify';
const sanitized = DOMPurify.sanitize(userInput);
```

**❌ Don't:**
```typescript
// Trust user input
const query = `SELECT * FROM users WHERE email = '${userInput}'`;  // SQL injection

// Display unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // XSS vulnerability
```

### Authentication & Authorization

**✅ Do:**
```typescript
// Check authentication
const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const user = await verifyToken(token);
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  c.set('user', user);
  await next();
};

// Check authorization
const requireAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  await next();
};
```

### Environment Variables

**✅ Do:**
```typescript
// Validate environment variables
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
```

**❌ Don't:**
```typescript
// Use environment variables without validation
const dbUrl = process.env.DATABASE_URL;  // May be undefined

// Commit secrets
const apiKey = 'sk_live_...';  // Never hardcode secrets
```

## Code Review Checklist

### For Authors

Before requesting review:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] TypeScript type-check passes
- [ ] ESLint passes with no warnings
- [ ] No console.logs or debugging code
- [ ] Error handling is comprehensive
- [ ] Documentation is updated
- [ ] Sensitive data is not exposed
- [ ] Performance considerations addressed

### For Reviewers

When reviewing code:
- [ ] Code is readable and maintainable
- [ ] Types are properly defined
- [ ] Error handling is appropriate
- [ ] Security concerns are addressed
- [ ] Performance is acceptable
- [ ] Tests cover new functionality
- [ ] Documentation is clear and accurate
- [ ] No obvious bugs or edge cases
- [ ] Follows project conventions

### Red Flags

Watch out for:
- ⚠️ `any` types
- ⚠️ Hardcoded secrets or API keys
- ⚠️ Missing error handling
- ⚠️ SQL injection vulnerabilities
- ⚠️ XSS vulnerabilities
- ⚠️ Exposed sensitive data in logs
- ⚠️ Missing input validation
- ⚠️ N+1 query problems
- ⚠️ Missing pagination on large datasets
- ⚠️ Unused code or comments

## Continuous Improvement

### Regular Reviews

- Review and update standards quarterly
- Gather feedback from team members
- Add new patterns as they emerge
- Remove outdated practices

### Learning Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [OWASP Security Guidelines](https://owasp.org/)
- [React Best Practices](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Questions or Suggestions?**

Open an issue or discussion on GitHub to improve these standards.

**Last Updated:** January 17, 2025
