import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { StudentSchema, StudentListResponseSchema, StudentQuerySchema } from './students.schema'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq, like, or, count } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'
import type { User } from '@supabase/supabase-js'

type Variables = {
  user: User
}

const app = new OpenAPIHono<{ Variables: Variables }>()

// Helper to safely decrypt
const safeDecrypt = (val: string | null) => {
    if (!val) return null;
    try {
        return decrypt(val);
    } catch (e) {
        return val; // Return original if encryption failed/not encrypted (migration safety)
    }
}

const listRoute = createRoute({
    method: 'get',
    path: '/',
    summary: 'List Students',
    description: 'Retrieve a paginated list of students. Requires Authentication.',
    security: [{ Bearer: [] }],
    request: {
        query: StudentQuerySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: StudentListResponseSchema,
                },
            },
            description: 'Successful response',
        },
    },
})

app.openapi(listRoute, async (c) => {
    const { page, limit, search } = c.req.valid('query')
    const offset = (page - 1) * limit

    // Prepare Query
    let whereClause = undefined;
    if (search) {
        whereClause = or(
            like(schema.students.studentId, `%${search}%`),
            like(schema.students.nameTh, `%${search}%`),
            like(schema.students.surnameTh, `%${search}%`),
            like(schema.students.nameEn, `%${search}%`),
            like(schema.students.surnameEn, `%${search}%`)
        )
    }

    // Count Total
    const [totalResult] = await db
        .select({ count: count() })
        .from(schema.students)
        .where(whereClause);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    // Fetch Data
    const students = await db.query.students.findMany({
        where: whereClause,
        limit: limit,
        offset: offset,
        orderBy: (students, { asc }) => [asc(students.studentId)],
    })

    // Transform & Decrypt
    const data = students.map(s => ({
        ...s,
        citizenId: safeDecrypt(s.citizenId),
    }));

    return c.json({
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    })
})


const meRoute = createRoute({
    method: 'get',
    path: '/me',
    summary: 'Get My Profile',
    description: 'Retrieve current authenticated user profile.',
    security: [{ Bearer: [] }],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: StudentSchema,
                },
            },
            description: 'Successful response',
        },
        404: {
            description: 'Student profile not found'
        }
    },
})

app.openapi(meRoute, async (c) => {
    try {
        const user = c.get('user')

        if (!user || !user.email) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const studentIdFromEmail = user.email.split('@')[0]

        // Support both full student ID and last 5 digits for Google Workspace compatibility
        const lastFive = studentIdFromEmail.slice(-5)

        const student = await db.query.students.findFirst({
            where: or(
                eq(schema.students.studentId, studentIdFromEmail),
                eq(schema.students.studentId, lastFive),
                eq(schema.students.email, user.email)
            )
        })

        if (!student) {
            return c.json({ error: 'Profile not found' }, 404)
        }

        const decryptedCitizenId = safeDecrypt(student.citizenId)

        return c.json({
            ...student,
            citizenId: decryptedCitizenId,
        })
    } catch (error) {
        console.error('[GET /students/me] Error:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

export default app
