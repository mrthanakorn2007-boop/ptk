# Troubleshooting: 403 Forbidden Error on /conduct/logs

## Problem

When trying to add/deduct conduct scores via the `/affairs` page, you receive a **403 Forbidden** error:

```
POST http://localhost:4001/conduct/logs
[HTTP/1.1 403 Forbidden]
Error: Request failed with status code 403
```

## Root Cause

The `/conduct/logs` endpoint requires the authenticated user to have a profile in the `profiles` table with one of these roles:
- `teacher`
- `admin`
- `student_affairs`

The 403 error occurs when:
1. **No profile exists**: The user doesn't have an entry in the `profiles` table
2. **Wrong role**: The user has a profile but with a different role (e.g., student)

## Solutions

### Solution 1: Run the Seed Script (Recommended for Development)

The seed script creates test accounts with proper profiles:

```bash
cd apps/backend
bun run seed
```

This creates:
- **Admin**: `admin@schoolptk.ac.th` / `admin123`
- **Teacher**: `teacher@schoolptk.ac.th` / `teacher123`
- **Student Affairs**: `affairs@schoolptk.ac.th` / `affairs123`
- **Students**: `65001@schoolptk.ac.th` / `1234567890123`

**To test the affairs dashboard:**
1. Logout from your current account
2. Login with `teacher@schoolptk.ac.th` / `teacher123`
3. Navigate to http://localhost:3000/affairs
4. Search for student "65001"
5. Add/deduct points

### Solution 2: Manually Create a Profile

If you want to use your existing account, add a profile entry to the database:

```sql
-- Get your user ID from Supabase Auth
-- Then insert a profile:

INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
    '<your-supabase-auth-user-id>',
    '<your-email>',
    '<your-first-name>',
    '<your-last-name>',
    'teacher'  -- or 'admin' or 'student_affairs'
);
```

**Steps:**
1. Go to Supabase Dashboard > Authentication > Users
2. Find your user and copy the UUID
3. Go to SQL Editor
4. Run the INSERT statement above with your details
5. Refresh the `/affairs` page and try again

### Solution 3: Use Supabase Dashboard

1. Open Supabase Dashboard
2. Go to **Table Editor**
3. Select the `profiles` table
4. Click **Insert** → **Insert row**
5. Fill in:
   - `id`: Your Supabase Auth User UUID (from Authentication > Users)
   - `email`: Your email address
   - `first_name`: Your first name
   - `last_name`: Your last name
   - `role`: Select `teacher`, `admin`, or `student_affairs`
6. Click **Save**
7. Refresh the `/affairs` page

## Verify Your Profile

To check if your profile is set up correctly:

### Option 1: Check Database Directly

```sql
-- Replace with your email
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE email = 'your-email@schoolptk.ac.th';
```

### Option 2: Check API Response

The improved error messages now tell you exactly what's wrong:

**If no profile exists:**
```json
{
  "error": "Forbidden - No profile found. Please ensure your user account is registered in the profiles table.",
  "userId": "uuid-here"
}
```

**If wrong role:**
```json
{
  "error": "Forbidden - Your role 'student' is not authorized. Required roles: teacher, admin, or student_affairs.",
  "currentRole": "student"
}
```

Use the `userId` or `currentRole` information to diagnose the issue.

## Common Scenarios

### Scenario 1: Testing with a Student Account

**Problem**: You're logged in as a student and trying to access `/affairs`

**Solution**: Students cannot manage conduct scores. Logout and login with a teacher/admin/affairs account.

### Scenario 2: First Time Setup

**Problem**: Fresh database with no profiles

**Solution**: Run `bun run seed` to populate the database with test accounts.

### Scenario 3: Production Setup

**Problem**: Real users need access to conduct management

**Solution**: 
1. Identify which staff members should manage conduct scores
2. Get their Supabase Auth User IDs
3. Insert profiles for each staff member with appropriate roles
4. Consider creating a staff management UI for admins to assign roles

## Testing Checklist

After fixing your profile:

- [ ] Can login to `/affairs` page
- [ ] Can search for students
- [ ] Can select a student
- [ ] Can add points (positive score change)
- [ ] Can deduct points (negative score change)
- [ ] See success message after submission
- [ ] Score updates immediately
- [ ] History shows new entry

## Need More Help?

1. Check the browser console for detailed error messages
2. Check backend logs for server-side errors
3. Verify database connection is working
4. Ensure you're running the latest migration
5. Review `TESTING_GUIDE.md` for comprehensive testing steps

## Related Files

- Seed script: `apps/backend/scripts/seed.ts`
- Migration: `apps/backend/migrations/001_add_conduct_logs_table.sql`
- Schema: `apps/backend/src/db/schema.ts`
- API Controller: `apps/backend/src/modules/conduct/conduct.controller.ts`
