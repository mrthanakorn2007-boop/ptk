import { db } from '../src/db'
import { students } from '../src/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { createClient } from '@supabase/supabase-js'
import { encrypt } from '../src/utils/encryption'
import fs from 'fs'
import path from 'path'

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
        // console.log(`   - User ${email} already exists. ID: ${existingUser.id}`)
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

const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

const main = async () => {
    const filePath = process.argv[2]
    if (!filePath) {
        console.error('Please provide a CSV file path: bun run scripts/import-students.ts <path-to-csv>')
        process.exit(1)
    }

    const absolutePath = path.resolve(filePath)
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`)
        process.exit(1)
    }

    console.log(`Reading file: ${absolutePath}`)
    const content = fs.readFileSync(absolutePath, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim() !== '')

    // Extract headers
    const headers = parseCSVLine(lines[0])
    console.log('Headers:', headers)

    // Expected headers: citizen_id,student_id,prefix,name_th,surname_th,name_en,surname_en,class,room,number,house,conduct_score,email

    let successCount = 0
    let failCount = 0

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        try {
            const values = parseCSVLine(line)

            // Map based on index (assuming fixed order from example or checking headers)
            // For simplicity, let's assume the user provides the exact order requested or we map by header index

            const getData = (headerName: string) => {
                const index = headers.indexOf(headerName)
                if (index === -1) return undefined
                return values[index]
            }

            const citizenId = getData('citizen_id')
            const studentId = getData('student_id')
            const prefix = getData('prefix')
            const nameTh = getData('name_th')
            const surnameTh = getData('surname_th')
            const nameEn = getData('name_en')
            const surnameEn = getData('surname_en')
            const classLevel = parseInt(getData('class') || '0')
            const room = parseInt(getData('room') || '0')
            const number = getData('number')
            const house = getData('house')
            const conductScore = parseInt(getData('conduct_score') || '150')
            const email = getData('email')

            if (!studentId || !email || !citizenId) {
                console.warn(`Skipping row ${i + 1}: Missing required fields (student_id, email, citizen_id)`)
                failCount++
                continue
            }

            console.log(`Processing ${studentId} (${nameTh} ${surnameTh})...`)

            // 1. Create Auth User
            // Use citizenId as initial password
            const userId = await ensureAuthUser(email, citizenId)

            // 2. Insert into DB
            await db.insert(students).values({
                id: createId(),
                citizenId: encrypt(citizenId),
                studentId,
                prefix,
                nameTh,
                surnameTh,
                nameEn,
                surnameEn,
                class: classLevel,
                room,
                number,
                house,
                conductScore,
                email,
                userId
            }).onConflictDoUpdate({
                target: students.studentId,
                set: {
                    citizenId: encrypt(citizenId),
                    prefix,
                    nameTh,
                    surnameTh,
                    nameEn,
                    surnameEn,
                    class: classLevel,
                    room,
                    number,
                    house,
                    conductScore,
                    email,
                    userId
                }
            })

            successCount++

        } catch (error) {
            console.error(`Error processing row ${i + 1}:`, error)
            failCount++
        }
    }

    console.log(`\n✅ Import complete!`)
    console.log(`Success: ${successCount}`)
    console.log(`Failed: ${failCount}`)
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
