# Conduct Score Feature - Testing Guide

## Pre-requisites

Before testing, ensure:

1. **Database Migration Completed**
   ```bash
   cd apps/backend
   bun run db:push
   ```
   Or manually run the SQL from `apps/backend/migrations/001_add_conduct_logs_table.sql`

2. **Environment Variables Set**
   - Copy `.env.example` to `.env` in `apps/backend/`
   - Fill in all required values:
     - DATABASE_URL
     - SUPABASE_URL
     - SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY (required for seed script)
     - REDIS_URL (optional for this feature)
     - ENCRYPTION_KEY

3. **Dependencies Installed**
   ```bash
   # Install all dependencies
   bun install
   
   # Or individually
   cd apps/backend && bun install
   cd apps/frontend && bun install
   ```

4. **Test Data Setup (IMPORTANT)**
   
   Run the seed script to create test accounts:
   ```bash
   cd apps/backend
   bun run seed
   ```
   
   This creates:
   - **Admin**: `admin@schoolptk.ac.th` / `admin123`
   - **Teacher**: `teacher@schoolptk.ac.th` / `teacher123`
   - **Student Affairs**: `affairs@schoolptk.ac.th` / `affairs123`
   - **Students**: `65001@schoolptk.ac.th` / `1234567890123`, `40935@schoolptk.ac.th` / `1234567890123`
   
   **⚠️ If you skip this step, you'll get 403 Forbidden errors when trying to manage conduct scores!**
   
   See `TROUBLESHOOTING_403.md` if you encounter authorization issues.

## Running the Application

### 1. Start Backend
```bash
cd apps/backend
bun run dev
```
The backend should start on `http://localhost:4001` (or configured PORT)

### 2. Start Frontend
```bash
cd apps/frontend
bun run dev
```
The frontend should start on `http://localhost:3000`

## Manual Testing Checklist

### A. Student View Testing

**Access:** `/features/conduct`

**Login as:** A student account

**Test Cases:**

1. **Initial Load**
   - [ ] Page loads without errors
   - [ ] Shows loading state while fetching data
   - [ ] Displays current conduct score after loading
   - [ ] Shows student name correctly

2. **Score Display**
   - [ ] Score number is displayed prominently
   - [ ] Correct tier badge is shown (ดีเยี่ยม/ผ่านเกณฑ์/ต้องปรับปรุง)
   - [ ] Color coding matches the tier (green/blue/red)
   - [ ] Visual indicator (bar) shows correct position

3. **History List**
   - [ ] If no history: Shows "ไม่มีประวัติการเปลี่ยนแปลงคะแนน"
   - [ ] If history exists: Shows all log entries
   - [ ] Each entry shows: reason, score change, date
   - [ ] Score changes are color-coded (green for +, red for -)
   - [ ] Dates are formatted correctly in Thai locale

4. **Error Handling**
   - [ ] If API fails: Shows error message
   - [ ] If not authenticated: Redirects to login or shows auth error

### B. Teacher/Affairs Dashboard Testing

**Access:** `/affairs`

**Login as:** A teacher, admin, or student_affairs account

**Test Cases:**

1. **Initial Load**
   - [ ] Page loads without errors
   - [ ] Shows empty state with search prompt
   - [ ] Search input is ready

2. **Student Search**
   - [ ] Type less than 2 characters: No search performed
   - [ ] Type 2+ characters: Search initiates
   - [ ] Loading state shown during search
   - [ ] Search results display correctly with:
     - Student name (prefix + first name + last name)
     - Student ID
     - Class and room
   - [ ] Can click on a student to select them
   - [ ] Search clears after selection

3. **Selected Student Display**
   - [ ] Student information shown correctly
   - [ ] Current conduct score displayed
   - [ ] Score management form appears

4. **Score Management Form**
   - [ ] Can toggle between "ตัดคะแนน" (deduct) and "เพิ่มคะแนน" (add)
   - [ ] Selected option is visually highlighted
   - [ ] Score input accepts numbers only
   - [ ] Score input validates min/max (1-100)
   - [ ] Reason textarea accepts text input
   - [ ] Submit button is enabled when all fields filled

5. **Score Submission**
   - [ ] Click submit: Shows loading state ("กำลังบันทึก...")
   - [ ] On success: Shows success alert
   - [ ] On success: Form clears (reason, score resets)
   - [ ] On success: Score updates immediately
   - [ ] On success: History list updates with new entry
   - [ ] On error: Shows error alert

6. **History Display** (after adding entries)
   - [ ] Shows all student's conduct logs
   - [ ] Each entry shows: reason, score change, date/time
   - [ ] Newest entries at the top
   - [ ] Score changes are color-coded
   - [ ] Dates formatted correctly

7. **Authorization**
   - [ ] Student accounts cannot access this page
   - [ ] Only teacher/admin/student_affairs can access

### C. API Endpoint Testing

Use tools like `curl`, Postman, or Thunder Client:

#### 1. GET /conduct/me
**Auth:** Student JWT token

```bash
curl -H "Authorization: Bearer <STUDENT_TOKEN>" \
  http://localhost:4001/conduct/me
```

**Expected Response:**
```json
{
  "studentId": "66001",
  "studentName": "นายสมชาย ใจดี",
  "totalScore": 150,
  "history": []
}
```

**Verify:**
- [ ] Returns 200 OK
- [ ] Returns student's conduct data
- [ ] Returns 401 if not authenticated
- [ ] Returns 404 if student not found

#### 2. GET /conduct/student/:studentId
**Auth:** Teacher JWT token

```bash
curl -H "Authorization: Bearer <TEACHER_TOKEN>" \
  http://localhost:4001/conduct/student/<STUDENT_ID>
```

**Verify:**
- [ ] Returns 200 OK with student conduct data
- [ ] Works with both student CUID and public studentId
- [ ] Returns 401 if not authenticated
- [ ] Returns 404 if student not found

#### 3. POST /conduct/logs
**Auth:** Teacher JWT token

```bash
curl -X POST \
  -H "Authorization: Bearer <TEACHER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"<STUDENT_ID>","scoreChange":-5,"reason":"มาสาย"}' \
  http://localhost:4001/conduct/logs
```

**Verify:**
- [ ] Returns 200 OK with created log
- [ ] Student's conductScore in database is updated
- [ ] New entry appears in conduct_logs table
- [ ] Returns 401 if not authenticated
- [ ] Returns 403 if not teacher/admin/student_affairs role
- [ ] Returns 404 if student not found
- [ ] Validates required fields

### D. Database Verification

Connect to your PostgreSQL database and verify:

```sql
-- Check conduct_logs table exists
SELECT * FROM conduct_logs LIMIT 5;

-- Check a student's conduct score
SELECT id, student_id, name, surname, conduct_score 
FROM students 
WHERE student_id = '66001';

-- Check conduct logs for a student
SELECT cl.*, p.first_name, p.last_name 
FROM conduct_logs cl
JOIN profiles p ON cl.teacher_id = p.id
WHERE cl.student_id = '<STUDENT_CUID>'
ORDER BY cl.created_at DESC;

-- Verify score calculation
SELECT 
  s.conduct_score as current_score,
  150 + COALESCE(SUM(cl.score_change), 0) as calculated_score
FROM students s
LEFT JOIN conduct_logs cl ON s.id = cl.student_id
WHERE s.student_id = '66001'
GROUP BY s.id, s.conduct_score;
```

**Verify:**
- [ ] conduct_logs table exists with correct schema
- [ ] Foreign keys are set up correctly
- [ ] Indexes exist on student_id, teacher_id, created_at
- [ ] Student conduct_score matches sum of all score_changes
- [ ] Timestamps are stored with timezone

## Integration Testing Scenarios

### Scenario 1: Student Gets Points Deducted
1. Login as teacher
2. Go to `/affairs`
3. Search for a student
4. Select student
5. Choose "ตัดคะแนน" (deduct)
6. Enter 5 points
7. Enter reason: "มาสาย"
8. Submit
9. **Verify:** Score decreased by 5
10. Logout and login as that student
11. Go to `/features/conduct`
12. **Verify:** Score shows decreased amount
13. **Verify:** History shows the deduction

### Scenario 2: Student Gets Points Added
1. Login as teacher
2. Go to `/affairs`
3. Search for a student
4. Select student
5. Choose "เพิ่มคะแนน" (add)
6. Enter 10 points
7. Enter reason: "ช่วยงานโรงเรียน"
8. Submit
9. **Verify:** Score increased by 10
10. Logout and login as that student
11. Go to `/features/conduct`
12. **Verify:** Score shows increased amount
13. **Verify:** History shows the addition

### Scenario 3: Multiple Teachers Recording Scores
1. Login as Teacher A
2. Deduct 5 points from Student X with reason
3. Logout
4. Login as Teacher B (different account)
5. Add 10 points to Student X with reason
6. Logout
7. Login as Student X
8. **Verify:** Both entries show in history
9. **Verify:** Net score change is +5 (150 - 5 + 10 = 155)

## Performance Testing

1. **Load Test History Display**
   - Add 100+ conduct logs for one student
   - Login as that student
   - Go to `/features/conduct`
   - **Verify:** Page loads in reasonable time (< 2 seconds)
   - **Verify:** All history entries render correctly

2. **Search Performance**
   - Ensure database has 100+ students
   - Login as teacher
   - Search with common names
   - **Verify:** Results return quickly (< 1 second)
   - **Verify:** Results are accurate

## Common Issues and Solutions

### Issue: "Profile not found" error
**Solution:** 
- Check student exists in `students` table
- Verify email mapping from auth to student record

### Issue: "Forbidden - Teacher/Affairs role required"
**Solution:**
- Check user exists in `profiles` table
- Verify role is one of: 'teacher', 'admin', 'student_affairs'

### Issue: Score not updating after submission
**Solution:**
- Check network tab for API errors
- Verify database connection
- Check foreign key constraints are satisfied
- Review backend logs

### Issue: History not showing
**Solution:**
- Check if conduct_logs table has entries
- Verify JOIN query on teacher profiles works
- Check date formatting

### Issue: Student search returns no results
**Solution:**
- Verify search query includes wildcard (`%`)
- Check students table has data
- Ensure search is case-insensitive

## Automated Testing (Future)

For production readiness, consider adding:

1. **Unit Tests**
   - API endpoint handlers
   - Score calculation logic
   - Data transformation functions

2. **Integration Tests**
   - Database operations
   - API request/response flow
   - Authentication and authorization

3. **E2E Tests**
   - Full user flows using Playwright or Cypress
   - Student viewing score
   - Teacher adding/deducting points

## Monitoring in Production

Set up monitoring for:
- API endpoint response times
- Database query performance
- Error rates (401, 403, 500)
- User activity (number of score changes per day)
- Data integrity (score matches sum of changes)
