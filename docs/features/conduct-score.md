# Conduct Score Feature Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│                                                                       │
│  ┌──────────────────────┐        ┌──────────────────────────────┐  │
│  │  Student View        │        │  Teacher/Affairs Dashboard   │  │
│  │  /features/conduct   │        │  /affairs                    │  │
│  ├──────────────────────┤        ├──────────────────────────────┤  │
│  │ - OverviewCard       │        │ - Student Search             │  │
│  │ - HistoryList        │        │ - Score Management Form      │  │
│  │ - Loading States     │        │ - Add/Deduct Toggle          │  │
│  │ - Error Handling     │        │ - History Display            │  │
│  └──────────────────────┘        └──────────────────────────────┘  │
│           │                                    │                     │
│           └────────────────┬───────────────────┘                     │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │ (with JWT Auth)
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│                            │         API LAYER                        │
│                            │                                          │
│                    ┌───────▼────────┐                                │
│                    │  Hono Server   │                                │
│                    │  (Backend)     │                                │
│                    └───────┬────────┘                                │
│                            │                                          │
│          ┌─────────────────┼─────────────────┐                       │
│          │                 │                 │                       │
│    ┌─────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐                │
│    │   Auth    │    │  Conduct   │   │  Students  │                │
│    │Middleware │    │ Controller │   │ Controller │                │
│    └───────────┘    └─────┬──────┘   └────────────┘                │
│                            │                                          │
│                    ┌───────▼────────┐                                │
│                    │ Conduct Schema │                                │
│                    │ (Zod Validation)│                               │
│                    └────────────────┘                                │
└──────────────────────────────────────────────────────────────────────┘
                             │
                             │ Drizzle ORM
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│                            │      DATABASE LAYER                      │
│                            │      (PostgreSQL)                        │
│                    ┌───────▼────────┐                                │
│                    │                │                                 │
│         ┌──────────┤   Database     ├──────────┐                     │
│         │          │                │          │                     │
│         │          └────────────────┘          │                     │
│         │                                      │                     │
│  ┌──────▼──────┐  ┌──────────────┐  ┌────────▼────────┐            │
│  │  students   │  │  profiles    │  │  conduct_logs   │            │
│  ├─────────────┤  ├──────────────┤  ├─────────────────┤            │
│  │ id (PK)     │  │ id (PK)      │  │ id (PK)         │            │
│  │ student_id  │  │ email        │  │ student_id (FK) │◄───┐       │
│  │ name        │  │ first_name   │  │ teacher_id (FK) │◄───┼───┐   │
│  │ surname     │  │ last_name    │  │ score_change    │    │   │   │
│  │ class       │  │ role         │  │ reason          │    │   │   │
│  │ room        │  └──────────────┘  │ created_at      │    │   │   │
│  │conduct_score│                    └─────────────────┘    │   │   │
│  └─────────────┘                                           │   │   │
│        │                                                    │   │   │
│        └────────────────────────────────────────────────────┘   │   │
│                                                                  │   │
│                                                                  │   │
│        profiles ─────────────────────────────────────────────────┘   │
│        (teacher who made the change)                                 │
└──────────────────────────────────────────────────────────────────────┘
```

## API Flow Diagrams

### Student Viewing Their Score

```
┌─────────┐                ┌─────────┐              ┌──────────┐
│ Student │                │   API   │              │ Database │
└────┬────┘                └────┬────┘              └────┬─────┘
     │                          │                        │
     │ GET /conduct/me          │                        │
     │ (with JWT token)         │                        │
     ├─────────────────────────>│                        │
     │                          │                        │
     │                          │ 1. Validate JWT        │
     │                          │ 2. Extract student ID  │
     │                          │                        │
     │                          │ Query student info     │
     │                          ├───────────────────────>│
     │                          │                        │
     │                          │ Student data           │
     │                          │<───────────────────────┤
     │                          │                        │
     │                          │ Query conduct_logs     │
     │                          ├───────────────────────>│
     │                          │                        │
     │                          │ Logs array             │
     │                          │<───────────────────────┤
     │                          │                        │
     │                          │ Batch query teachers   │
     │                          ├───────────────────────>│
     │                          │                        │
     │                          │ Teachers array         │
     │                          │<───────────────────────┤
     │                          │                        │
     │                          │ 3. Join data           │
     │                          │ 4. Format response     │
     │                          │                        │
     │ JSON Response:           │                        │
     │ {                        │                        │
     │   studentId,             │                        │
     │   studentName,           │                        │
     │   totalScore,            │                        │
     │   history: [...]         │                        │
     │ }                        │                        │
     │<─────────────────────────┤                        │
     │                          │                        │
```

### Teacher Adding/Deducting Points

```
┌─────────┐                ┌─────────┐              ┌──────────┐
│ Teacher │                │   API   │              │ Database │
└────┬────┘                └────┬────┘              └────┬─────┘
     │                          │                        │
     │ POST /conduct/logs       │                        │
     │ {                        │                        │
     │   studentId,             │                        │
     │   scoreChange: -5,       │                        │
     │   reason: "มาสาย"        │                        │
     │ }                        │                        │
     ├─────────────────────────>│                        │
     │                          │                        │
     │                          │ 1. Validate JWT        │
     │                          │ 2. Check teacher role  │
     │                          │                        │
     │                          │ Query teacher profile  │
     │                          ├───────────────────────>│
     │                          │                        │
     │                          │ Profile with role      │
     │                          │<───────────────────────┤
     │                          │                        │
     │                          │ Verify role is         │
     │                          │ teacher/admin/affairs  │
     │                          │                        │
     │                          │ Query student          │
     │                          ├───────────────────────>│
     │                          │                        │
     │                          │ Student data           │
     │                          │<───────────────────────┤
     │                          │                        │
     │                          │ BEGIN TRANSACTION      │
     │                          │                        │
     │                          │ INSERT conduct_log     │
     │                          ├───────────────────────>│
     │                          │                        │
     │                          │ New log record         │
     │                          │<───────────────────────┤
     │                          │                        │
     │                          │ UPDATE student         │
     │                          │ SET conduct_score =    │
     │                          │   old_score +          │
     │                          │   score_change         │
     │                          ├───────────────────────>│
     │                          │                        │
     │                          │ Updated student        │
     │                          │<───────────────────────┤
     │                          │                        │
     │                          │ COMMIT TRANSACTION     │
     │                          │                        │
     │ JSON Response:           │                        │
     │ {                        │                        │
     │   id,                    │                        │
     │   studentId,             │                        │
     │   scoreChange,           │                        │
     │   reason,                │                        │
     │   createdAt              │                        │
     │ }                        │                        │
     │<─────────────────────────┤                        │
     │                          │                        │
```

## Data Flow

### Score Calculation

```
Initial State:
┌─────────────────┐
│ Student         │
│ conduct_score:  │
│     150         │
└─────────────────┘

After Deduction (-5):
┌─────────────────┐       ┌──────────────────┐
│ Student         │       │ conduct_logs     │
│ conduct_score:  │       │ score_change: -5 │
│     145         │◄──────│ reason: "มาสาย"  │
└─────────────────┘       │ created_at: now  │
                          └──────────────────┘

After Addition (+10):
┌─────────────────┐       ┌──────────────────┐
│ Student         │       │ conduct_logs     │
│ conduct_score:  │       │ score_change: +10│
│     155         │◄──────│ reason: "ช่วย..." │
└─────────────────┘       │ created_at: now  │
                          └──────────────────┘

Score History = Initial (150) + Sum of all score_changes
155 = 150 + (-5) + (+10)
```

## Component Hierarchy

### Student View

```
ConductPage
├── FeatureHeader (title: "คะแนนความประพฤติ")
├── Loading State (when isLoading)
├── Error State (when error)
└── Data Display (when conductData exists)
    ├── OverviewCard
    │   ├── Student Name
    │   ├── Current Score (large number)
    │   ├── Tier Badge (ดีเยี่ยม/ผ่านเกณฑ์/ต้องปรับปรุง)
    │   └── Visual Indicator (progress bar)
    ├── History Section
    │   └── HistoryList
    │       └── HistoryItem (for each log)
    │           ├── Icon
    │           ├── Reason text
    │           ├── Score change (+/-)
    │           └── Timestamp
    └── Support Section
        ├── Student Handbook Link
        └── Dispute Button
```

### Teacher/Affairs Dashboard

```
AffairsPage
├── FeatureHeader (title: "จัดการคะแนนความประพฤติ")
├── Search Section
│   ├── Search Input
│   ├── Loading indicator
│   └── Search Results List
│       └── Student Item (clickable)
│           ├── Name
│           ├── Student ID
│           └── Class/Room
├── Selected Student Section (if student selected)
│   ├── Student Info Card
│   │   ├── Name
│   │   ├── Student ID & Class
│   │   └── Current Score
│   ├── Score Management Form
│   │   ├── Action Type Toggle (Add/Deduct)
│   │   ├── Score Amount Input
│   │   ├── Reason Textarea
│   │   ├── Status Message (success/error)
│   │   └── Submit Button
│   └── History Section
│       └── Conduct Log List
│           └── Log Item
│               ├── Reason
│               ├── Score change
│               └── Timestamp
└── Empty State (if no student selected)
    └── Search prompt
```

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
└─────────────────────────────────────────────────────────────┘

User Login (Supabase Auth)
        │
        ├─ JWT Token Generated
        │
        ▼
Request to API with JWT in Authorization header
        │
        ├─ Auth Middleware validates token
        │
        ├─ Extract user ID from token
        │
        ▼
Check user role in profiles table
        │
        ├─ Student role → Can access /conduct/me only
        │
        ├─ Teacher/Admin/Affairs → Can access all endpoints
        │
        └─ No profile or invalid role → 403 Forbidden

┌─────────────────────────────────────────────────────────────┐
│                   Authorization Matrix                       │
├─────────────────┬──────────────┬──────────────┬─────────────┤
│ Endpoint        │ Student      │ Teacher      │ Admin       │
├─────────────────┼──────────────┼──────────────┼─────────────┤
│ GET /conduct/me │ ✅ Own only  │ ✅ Own only  │ ✅ Own only │
│ GET /conduct/   │ ❌ Forbidden │ ✅ Any       │ ✅ Any      │
│     student/:id │              │   student    │   student   │
│ POST /conduct/  │ ❌ Forbidden │ ✅ Can add/  │ ✅ Can add/ │
│      logs       │              │   deduct     │   deduct    │
└─────────────────┴──────────────┴──────────────┴─────────────┘
```

## File Organization

```
PTK-Connext/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts           (+ conduct_logs table)
│   │   │   │   └── index.ts
│   │   │   ├── modules/
│   │   │   │   ├── conduct/            (NEW)
│   │   │   │   │   ├── conduct.controller.ts
│   │   │   │   │   └── conduct.schema.ts
│   │   │   │   └── students/
│   │   │   ├── middlewares/
│   │   │   │   └── auth.ts
│   │   │   └── index.ts                (+ conduct routes)
│   │   ├── migrations/                 (NEW)
│   │   │   ├── 001_add_conduct_logs_table.sql
│   │   │   └── README.md
│   │   └── package.json                (+ db scripts)
│   └── frontend/
│       └── src/
│           ├── app/
│           │   ├── affairs/            (NEW)
│           │   │   └── page.tsx
│           │   └── features/conduct/
│           │       └── page.tsx        (MODIFIED)
│           ├── components/features/conduct/
│           │   ├── overview-card.tsx   (MODIFIED)
│           │   └── history-list.tsx    (MODIFIED)
│           └── lib/api/
│               ├── conduct.ts          (NEW)
│               └── conduct.hooks.ts    (NEW)
├── CONDUCT_FEATURE_README.md           (NEW)
├── TESTING_GUIDE.md                    (NEW)
├── IMPLEMENTATION_SUMMARY.md           (NEW)
└── ARCHITECTURE.md                     (THIS FILE)
```

## Performance Considerations

### Database Queries
- **N+1 Problem Solved**: Batch fetch teacher profiles instead of one query per log
- **Indexes**: Created on student_id, teacher_id, and created_at for fast lookups
- **Query Optimization**: Use `inArray` for batch queries

### Frontend Performance
- **React Query Caching**: Reduces unnecessary API calls
- **Loading States**: Prevents multiple simultaneous requests
- **Optimistic Updates**: UI updates immediately, revalidates in background

### Scalability
- **Database**: Indexes handle large number of logs efficiently
- **API**: Stateless design allows horizontal scaling
- **Frontend**: Component-based architecture for easy optimization

## Security Considerations

### Authentication
- JWT tokens validated on every request
- Tokens expire (configured in Supabase)
- HTTPS required in production

### Authorization
- Role-based access control
- Teachers can only add/deduct, not delete logs
- Students can only view their own data
- Audit trail cannot be modified

### Data Validation
- Zod schemas validate all inputs
- SQL injection prevented by ORM
- XSS prevented by React's built-in escaping
- CORS configured properly

### Audit Trail
- All changes logged with timestamp
- Teacher ID recorded for accountability
- Reasons required for all changes
- Immutable logs (no delete/update endpoints)
