import { db } from '../src/db'
import { students, profiles, academicTerms } from '../src/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { createClient } from '@supabase/supabase-js'
import { encrypt } from '../src/utils/encryption'
import { eq } from 'drizzle-orm'

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const ensureAuthUser = async (email: string, password?: string, role?: string) => {
    // Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
        console.log(`   - User ${email} already exists. ID: ${existingUser.id}`)
        // Force update password if provided
        if (password) {
            console.log(`   - Updating password for ${email}...`)
            await supabase.auth.admin.updateUserById(existingUser.id, { password })
        }
        return existingUser.id
    }

    // Create user
    console.log(`   - Creating user ${email}...`)
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: password || 'password123',
        email_confirm: true,
        user_metadata: role ? { role } : {}
    })

    if (createError) throw createError
    if (!user) throw new Error('Failed to create user')

    return user.id
}

const main = async () => {
    console.log('🌱 Seeding database...')

    // 0. Seed Academic Terms
    console.log('🔹 Seeding Academic Terms...')
    const termsToSeed = [
        {
            name: '1/2566',
            startDate: '2023-05-16',
            endDate: '2023-10-10',
            type: 'term1' as const
        },
        {
            name: '2/2566',
            startDate: '2023-11-01',
            endDate: '2024-03-31',
            type: 'term2' as const
        },
        {
            name: '1/2567',
            startDate: '2024-05-16',
            endDate: '2024-10-10',
            type: 'term1' as const
        },
        {
            name: '2/2567',
            startDate: '2024-11-01',
            endDate: '2025-03-31',
            type: 'term2' as const
        },
        {
            name: '1/2568',
            startDate: '2025-05-16',
            endDate: '2025-10-10',
            type: 'term1' as const
        },
        {
            name: '2/2568',
            startDate: '2025-11-01',
            endDate: '2026-03-31',
            type: 'term2' as const
        }
    ];

    for (const term of termsToSeed) {
        // Check if term exists by name to avoid duplicates if re-run
        const existing = await db.query.academicTerms.findFirst({
            where: eq(academicTerms.name, term.name)
        });

        if (!existing) {
            await db.insert(academicTerms).values({
                id: createId(),
                ...term
            })
            console.log(`   - Created term ${term.name}`)
        }
    }

    // Seed Break/Summer Terms
    const breaksToSeed = [
        { name: 'Summer 2566', startDate: '2023-04-01', endDate: '2023-05-15', type: 'summer' as const },
        { name: 'Break 1/2566', startDate: '2023-10-11', endDate: '2023-10-31', type: 'other' as const },
        { name: 'Summer 2567', startDate: '2024-04-01', endDate: '2024-05-15', type: 'summer' as const },
        { name: 'Break 1/2567', startDate: '2024-10-11', endDate: '2024-10-31', type: 'other' as const },
        { name: 'Summer 2568', startDate: '2025-04-01', endDate: '2025-05-15', type: 'summer' as const },
        { name: 'Break 1/2568', startDate: '2025-10-11', endDate: '2025-10-31', type: 'other' as const },
    ];

    for (const term of breaksToSeed) {
         const existing = await db.query.academicTerms.findFirst({
            where: eq(academicTerms.name, term.name)
        });

        if (!existing) {
             await db.insert(academicTerms).values({
                id: createId(),
                ...term
            })
            console.log(`   - Created break term ${term.name}`)
        }
    }


    // 1. Create Profiles (Staff)
    console.log('🔹 Seeding Staff...')

    // Admin
    const adminUserId = await ensureAuthUser('admin@schoolptk.ac.th', 'admin123', 'admin')
    await db.insert(profiles).values({
        id: adminUserId,
        email: 'admin@schoolptk.ac.th',
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin'
    }).onConflictDoUpdate({ target: profiles.id, set: { email: 'admin@schoolptk.ac.th', role: 'admin' } })

    // Teacher
    const teacherUserId = await ensureAuthUser('teacher@schoolptk.ac.th', 'teacher123', 'teacher')
    await db.insert(profiles).values({
        id: teacherUserId,
        email: 'teacher@schoolptk.ac.th',
        firstName: 'John',
        lastName: 'Doe',
        role: 'teacher'
    }).onConflictDoUpdate({ target: profiles.id, set: { email: 'teacher@schoolptk.ac.th', role: 'teacher' } })

    // Student Affairs
    const saUserId = await ensureAuthUser('affairs@schoolptk.ac.th', 'affairs123', 'student_affairs')
    await db.insert(profiles).values({
        id: saUserId,
        email: 'affairs@schoolptk.ac.th',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student_affairs'
    }).onConflictDoUpdate({ target: profiles.id, set: { email: 'affairs@schoolptk.ac.th', role: 'student_affairs' } })

    // Additional Admin User (if needed)
    // Note: Admin user already created above at line 56, this is intentionally removed to avoid duplication

    // 2. Create Students
    console.log('🔹 Seeding Students...')

    // Student 1: 65001
    // Login: 65001@schoolptk.ac.th / 1234567890123
    const student1CitizenId = '1234567890123'
    const student1UserId = await ensureAuthUser('65001@schoolptk.ac.th', student1CitizenId)

    await db.insert(students).values({
        id: createId(),
        citizenId: encrypt(student1CitizenId), // Encrypted
        studentId: '65001',
        prefix: 'นาย',
        nameTh: 'สมชาย',
        surnameTh: 'ใจดี',
        nameEn: 'Somchai',
        surnameEn: 'Jaidee',
        class: 1,
        room: 1,
        number: '1',
        house: 'บ้าน 1',
        conductScore: 150,
        email: '65001@schoolptk.ac.th',
        userId: student1UserId
    }).onConflictDoUpdate({
        target: students.studentId,
        set: { userId: student1UserId, citizenId: encrypt(student1CitizenId) }
    })

    // 3. Create Sample Notifications
    console.log('🔹 Seeding Notifications...')
    
    const { notifications } = await import('../src/db/schema')
    
    await db.insert(notifications).values([
        {
            title: 'Welcome to PTK-Connext!',
            content: 'ยินดีต้อนรับสู่ระบบ PTK-Connext ระบบจัดการโรงเรียนที่ทันสมัย',
            type: 'general',
            targetAudience: 'all',
            createdBy: adminUserId,
        },
        {
            title: 'School Holiday Announcement',
            content: 'โรงเรียนจะปิดในวันที่ 25-26 มกราคม 2567 เนื่องจากวันหยุดนักขัตฤกษ์',
            type: 'urgent',
            targetAudience: 'all',
            createdBy: adminUserId,
        },
    ]).onConflictDoNothing()

    console.log('✅ Seeding complete!')
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
