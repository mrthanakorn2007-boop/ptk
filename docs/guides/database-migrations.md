# Database Migrations

## Running Migrations

### Option 1: Using Drizzle Kit Push (Recommended for Development)

This will automatically sync your schema to the database without creating migration files:

```bash
cd apps/backend
bun run db:push
```

### Option 2: Manual SQL Migration

If you prefer to run migrations manually or need more control:

1. Connect to your PostgreSQL database
2. Run the SQL file:

```bash
psql $DATABASE_URL -f migrations/001_add_conduct_logs_table.sql
```

Or through Supabase SQL Editor:
- Go to Supabase Dashboard > SQL Editor
- Copy and paste the content of `migrations/001_add_conduct_logs_table.sql`
- Click "Run"

## Migration Files

- `001_add_conduct_logs_table.sql` - Creates the conduct_logs table for tracking student conduct score changes

## Schema Overview

### Tables Created

#### conduct_logs
Tracks all changes to student conduct scores.

Columns:
- `id` (TEXT, PK) - Unique identifier (CUID)
- `student_id` (TEXT, FK) - Reference to students table
- `teacher_id` (UUID, FK) - Reference to profiles table (teacher/affairs who made the change)
- `score_change` (INTEGER) - The score change amount (negative for deduction, positive for addition)
- `reason` (TEXT) - Explanation for the score change
- `created_at` (TIMESTAMP) - When the change was made

Indexes:
- `idx_conduct_logs_student_id` - For efficient student lookup
- `idx_conduct_logs_teacher_id` - For efficient teacher lookup
- `idx_conduct_logs_created_at` - For chronological sorting

## Verification

After running the migration, verify it worked:

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'conduct_logs';

-- Check table structure
\d conduct_logs
```
