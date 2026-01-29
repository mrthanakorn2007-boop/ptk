# Database Documentation

## Overview
This project uses **PostgreSQL** as the primary database, managed by **Drizzle ORM**. The schema is defined in TypeScript, providing full type safety across the application.

## Schema Definition
The database schema is located at `src/db/schema.ts`.

### Core Tables
- **students**: Stores student information including Citizen ID (encrypted/private) and Student ID (public).
- **teachers**: Stores teacher profiles.
- **rooms**: Physical classrooms and facilities.
- **subjects**: Academic subjects with credits.
- **schedules**: Class timetables linking subjects, teachers, rooms, and times.

### Academic Tables
- **assignments**: Tasks assigned to specific classes.
- **student_assignments**: Submission status and scores for individual students.
- **scores**: Exam or category-based scores (e.g., Midterm, Final).

### System Tables
- **notifications**: System-wide or targeted notifications.

## Working with the Database

### Prerequisites
Ensure your `.env` file contains the correct `DATABASE_URL`.
```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
```

### Schema Management
We use `drizzle-kit` to manage schema changes.

**1. Generate Migrations**
If you make changes to `src/db/schema.ts`, generate a new migration file:
```bash
bun x drizzle-kit generate
```

**2. Push Changes (Prototyping)**
For rapid development, you can push schema changes directly to the database without creating migration files (be careful in production):
```bash
bun x drizzle-kit push
```

**3. Apply Migrations**
To apply generated migrations:
```bash
bun x drizzle-kit migrate
```

### Studio
Drizzle Kit comes with a built-in database studio to view and edit data:
```bash
bun x drizzle-kit studio
```

## Seeding Data
The project includes a seed script to populate the database with initial test data (Teacher, Room, Student, Subject, Schedule, etc.).

**Run the seed script:**
```bash
bun run seed
```
*Note: The seed script uses `onConflictDoNothing()` for some tables to prevent duplication errors on repeated runs.*
