# Conduct Score Feature - MVP Implementation

## Overview

This MVP implementation provides a functional conduct score system where:
- Students can view their current conduct score and history
- Teachers/Affairs staff can search for students and add/deduct conduct points with reasons
- All changes are tracked in the database with timestamps and reasons

## Features Implemented

### 1. Database Schema
- Added `conduct_logs` table to track all score changes
- Maintains foreign key relationships with `students` and `profiles` tables
- Indexes for efficient querying

### 2. Backend API Endpoints

#### GET `/conduct/me`
Get the authenticated student's conduct score and history.

**Response:**
```json
{
  "studentId": "66001",
  "studentName": "นายสมชาย ใจดี",
  "totalScore": 95,
  "history": [
    {
      "id": "cuid_xyz",
      "studentId": "cuid_student",
      "teacherId": "uuid_teacher",
      "scoreChange": -5,
      "reason": "มาสายเกิน 15 นาที",
      "createdAt": "2024-06-10T08:30:00Z"
    }
  ]
}
```

#### GET `/conduct/student/{studentId}`
Get a specific student's conduct score (for teachers/affairs).

**Parameters:**
- `studentId` - Student CUID or public studentId

**Response:** Same as `/conduct/me`

#### POST `/conduct/logs`
Record a new conduct score change (teachers/affairs only).

**Request:**
```json
{
  "studentId": "cuid_student123",
  "scoreChange": -5,
  "reason": "มาสายเกิน 15 นาที"
}
```

**Authorization:** Requires teacher, admin, or student_affairs role

### 3. Frontend - Student View

**Route:** `/features/conduct`

Features:
- Displays current conduct score with visual indicator
- Color-coded tiers (ดีเยี่ยม, ผ่านเกณฑ์, ต้องปรับปรุง)
- History list showing all score changes
- Real-time data from database

### 4. Frontend - Teacher/Affairs Dashboard

**Route:** `/affairs`

Features:
- Student search by name or ID
- Display selected student's current score
- Score management form:
  - Choose action type (add/deduct)
  - Enter score amount
  - Provide reason
- View student's conduct history
- Real-time updates after submission

## Setup Instructions

### 1. Database Migration

Run the database migration to create the `conduct_logs` table:

```bash
cd apps/backend
bun run db:push
```

Or manually run the SQL from `apps/backend/migrations/001_add_conduct_logs_table.sql`

See `apps/backend/migrations/README.md` for detailed instructions.

### 2. Backend Setup

The backend is already configured. Just ensure you have:
- DATABASE_URL configured in `.env`
- SUPABASE_URL and SUPABASE_ANON_KEY configured
- Backend running on port 4001 (or configured port)

```bash
cd apps/backend
bun run dev
```

### 3. Frontend Setup

The frontend is already configured to connect to the backend API.

```bash
cd apps/frontend
bun run dev
```

## Usage

### For Students

1. Navigate to `/features/conduct`
2. View your current conduct score
3. Review your score change history

### For Teachers/Affairs

1. Navigate to `/affairs`
2. Search for a student by name or student ID
3. Select the student from search results
4. Choose to add or deduct points
5. Enter the amount and reason
6. Click "ยืนยันบันทึก" to submit

## Core Logic

### Initial Score
- All students start with 150 points (configurable via `conduct_score` default in schema)

### Score Changes
- Points can be deducted (negative values) or added (positive values)
- Every change requires a reason
- Every change is associated with the teacher/staff who made it
- Changes are permanent and tracked in the database

### Score Tiers (Frontend Display)
- **ดีเยี่ยม** (Excellent): 150+ points - Green
- **ผ่านเกณฑ์** (Passing): 50-149 points - Blue
- **ต้องปรับปรุง** (Needs Improvement): Below 50 points - Red

## API Authentication

All endpoints require authentication via Supabase JWT token:
- Token is automatically included via axios interceptor
- Teachers/affairs endpoints check user role from `profiles` table

## Database Schema

### conduct_logs Table
```sql
CREATE TABLE conduct_logs (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  score_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### students Table (existing, modified)
- Added: `conduct_score INTEGER DEFAULT 150 NOT NULL`

### profiles Table (existing)
- Used for teacher/affairs authentication
- Role field determines access to conduct management

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Student can view their conduct score
- [ ] Student sees empty state when no history exists
- [ ] Teacher can search for students
- [ ] Teacher can add points with reason
- [ ] Teacher can deduct points with reason
- [ ] Score updates immediately after submission
- [ ] History displays correctly after changes
- [ ] Authentication works correctly
- [ ] Role-based access control works (only teachers/affairs can modify scores)

## Future Enhancements (Not in MVP)

- Semester-based filtering
- Category system for different types of infractions/achievements
- Bulk import/export
- Reports and analytics
- Notifications to students when score changes
- Dispute/appeal system
- Photo evidence upload
- Parent portal access

## Troubleshooting

### "Profile not found" error
- Ensure user exists in `students` table
- Check email mapping is correct

### "Forbidden - Teacher/Affairs role required"
- Verify user exists in `profiles` table
- Check user has correct role (teacher, admin, or student_affairs)

### Score not updating
- Check database connection
- Verify foreign key constraints are satisfied
- Check backend logs for errors

## File Structure

```
apps/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── schema.ts (conductLogs table added)
│   │   ├── modules/
│   │   │   └── conduct/
│   │   │       ├── conduct.controller.ts (API endpoints)
│   │   │       └── conduct.schema.ts (Zod schemas)
│   │   └── index.ts (routes registered)
│   └── migrations/
│       ├── 001_add_conduct_logs_table.sql
│       └── README.md
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── affairs/
    │   │   │   └── page.tsx (Teacher dashboard)
    │   │   └── features/conduct/
    │   │       └── page.tsx (Student view)
    │   ├── components/features/conduct/
    │   │   ├── overview-card.tsx (Score display)
    │   │   └── history-list.tsx (Score history)
    │   └── lib/api/
    │       ├── conduct.ts (API client)
    │       └── conduct.hooks.ts (React Query hooks)
```
