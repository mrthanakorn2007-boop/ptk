# Student Import Guide

This guide details the process and logic for importing student data into PTK-Connext using the bulk import utility.

## Overview

The system uses a TypeScript script (`apps/backend/scripts/import-students.ts`) to parse CSV data, synchronize it with Supabase Authentication, and populate the PostgreSQL database.

## Prerequisites

- **Environment Variables**: The `apps/backend/.env` file must contain:
  - `SUPABASE_URL`: Your Supabase project URL.
  - `SUPABASE_SERVICE_ROLE_KEY`: The **Service Role** key (starts with `ey...`). This is required to create users programmatically via the Admin API.
  - `ENCRYPTION_KEY`: The key used to encrypt sensitive fields like `citizen_id`.

## Usage

Run the script from the `apps/backend` directory:

```bash
cd apps/backend
bun run scripts/import-students.ts <path-to-csv>
```

**Example:**
```bash
bun run scripts/import-students.ts ../../docs/examples/students_example.csv
```

## CSV Specifications

The CSV file must contain the following headers. The order does not strictly matter as the script maps by header name, but the following structure is recommended:

```csv
citizen_id,student_id,prefix,name_th,surname_th,name_en,surname_en,class,room,number,house,conduct_score,email
```

| Field | Description | Logic |
|-------|-------------|-------|
| `citizen_id` | National ID | **Encrypted** in DB. Used as **Initial Password**. |
| `student_id` | Student ID | Primary unique identifier for the student. |
| `email` | School Email | Used as the **Username** for Supabase Auth. |
| `conduct_score`| Integer | Defaults to `150` if left empty. |

## Implementation Logic

The script performs the following operations for each row in the CSV:

### 1. Data Parsing
- Reads the file using Node's `fs` module.
- Parses CSV lines manually (handling quoted strings) to extract values map them to headers.

### 2. Authentication Synchronization (Supabase)
- **Check Existence**: Queries Supabase Admin API (`listUsers`) to see if a user with the given `email` already exists.
- **Create User**: If not found, creates a new user:
  - **Email**: From CSV.
  - **Password**: `citizen_id` (Plaintext).
  - **Email Confirm**: Auto-confirmed (`email_confirm: true`).
- **Idempotency**: If the user exists, it skips creation and uses the existing `user.id`.

### 3. Data Encryption
- The `citizen_id` is considered Sensitive PII (Personally Identifiable Information).
- It is encrypted using AES-256-GCM (via `src/utils/encryption.ts`) before being stored in the database.
- The encryption key is derived from the `ENCRYPTION_KEY` env var.

### 4. Database Upsert
- The script uses Drizzle ORM to perform an `insert` with `onConflictDoUpdate`.
- **Target**: `student_id` (Unique Constraint).
- **Action**: If the student exists, their details (name, class, room, etc.) are updated to match the CSV, ensuring the database stays in sync with the latest school roster.
- **Linkage**: The `userId` (UUID from Supabase) is stored in the `students` table to link the auth account with the data record.

## Troubleshooting

- **`Missing SUPABASE_SERVICE_ROLE_KEY`**: The script requires admin privileges. Ensure you are not using the `ANON_KEY`.
- **`Crypto/Encryption Error`**: Ensure `ENCRYPTION_KEY` is set and consistent. Changing this key will make existing encrypted data unreadable.
- **`Row Skipped`**: Rows missing `student_id`, `email`, or `citizen_id` are automatically skipped and logged.
