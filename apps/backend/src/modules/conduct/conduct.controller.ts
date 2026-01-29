import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { 
    ConductScoreResponseSchema, 
    CreateConductLogSchema,
    StudentIdParamSchema,
    ConductLogSchema,
    ConductFilterQuerySchema
} from './conduct.schema'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq, desc, or, inArray, and } from 'drizzle-orm'
import type { User } from '@supabase/supabase-js'

type Variables = {
  user: User
}

const app = new OpenAPIHono<{ Variables: Variables }>()

// Default conduct score for new students
const DEFAULT_CONDUCT_SCORE = 150
// GET /conduct/me - Get current student's conduct score and history
const getMeRoute = createRoute({
    method: 'get',
    path: '/me',
    summary: 'Get My Conduct Score',
    description: 'Retrieve current authenticated student conduct score and history',
    security: [{ Bearer: [] }],
    request: {
        query: ConductFilterQuerySchema
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: ConductScoreResponseSchema,
                },
            },
            description: 'Successful response',
        },
        404: {
            description: 'Student profile not found'
        }
    },
})

app.openapi(getMeRoute, async (c) => {
    try {
        const user = c.get('user')
        const { termId } = c.req.query()

        if (!user || !user.email) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const studentIdFromEmail = user.email.split('@')[0]
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

        // Fetch conduct logs for this student
        // If termId is provided, filter by it
        const whereClause = termId
            ? and(
                eq(schema.conductLogs.studentId, student.id),
                eq(schema.conductLogs.termId, termId)
            )
            : eq(schema.conductLogs.studentId, student.id)

        const logs = await db.query.conductLogs.findMany({
            where: whereClause,
            orderBy: [desc(schema.conductLogs.createdAt)],
        })

        // Fetch all unique teacher profiles in one query to avoid N+1
        const teacherIds = Array.from(new Set(logs.map(log => log.teacherId)))
        const teachers = teacherIds.length > 0 
            ? await db.query.profiles.findMany({
                where: inArray(schema.profiles.id, teacherIds)
            })
            : []
        
        // Create a map for quick teacher lookup
        const teacherMap = new Map(teachers.map(t => [t.id, t]))

        // Map logs with teacher names
        const logsWithTeacherNames = logs.map(log => {
            const teacher = teacherMap.get(log.teacherId)
            return {
                id: log.id,
                studentId: log.studentId,
                teacherId: log.teacherId,
                scoreChange: log.scoreChange,
                reason: log.reason,
                termId: log.termId,
                createdAt: log.createdAt?.toISOString() || new Date().toISOString(),
                teacherName: teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : 'Unknown'
            }
        })

        const studentName = `${student.prefix || ''} ${student.nameTh || ''} ${student.surnameTh || ''}`.trim()

        return c.json({
            studentId: student.studentId || student.id,
            studentName: studentName || 'Unknown Student',
            totalScore: student.conductScore || DEFAULT_CONDUCT_SCORE,
            history: logsWithTeacherNames.map(log => ({
                id: log.id,
                studentId: log.studentId,
                teacherId: log.teacherId,
                scoreChange: log.scoreChange,
                reason: log.reason,
                termId: log.termId,
                createdAt: log.createdAt,
            }))
        })
    } catch (error) {
        console.error('[GET /conduct/me] Error:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

// GET /conduct/student/:studentId - Get specific student's conduct score (for teachers/affairs)
const getStudentRoute = createRoute({
    method: 'get',
    path: '/student/{studentId}',
    summary: 'Get Student Conduct Score',
    description: 'Retrieve specific student conduct score and history (teachers/affairs only)',
    security: [{ Bearer: [] }],
    request: {
        params: StudentIdParamSchema,
        query: ConductFilterQuerySchema
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: ConductScoreResponseSchema,
                },
            },
            description: 'Successful response',
        },
        404: {
            description: 'Student not found'
        }
    },
})

app.openapi(getStudentRoute, async (c) => {
    try {
        const user = c.get('user')
        const { studentId } = c.req.valid('param')
        const { termId } = c.req.query()

        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        // Find student by studentId or CUID
        const student = await db.query.students.findFirst({
            where: or(
                eq(schema.students.studentId, studentId),
                eq(schema.students.id, studentId)
            )
        })

        if (!student) {
            return c.json({ error: 'Student not found' }, 404)
        }

        // Fetch conduct logs for this student
        // If termId is provided, filter by it
        const whereClause = termId
            ? and(
                eq(schema.conductLogs.studentId, student.id),
                eq(schema.conductLogs.termId, termId)
            )
            : eq(schema.conductLogs.studentId, student.id)

        const logs = await db.query.conductLogs.findMany({
            where: whereClause,
            orderBy: [desc(schema.conductLogs.createdAt)],
        })

        // Fetch all unique teacher profiles in one query to avoid N+1
        const teacherIds = Array.from(new Set(logs.map(log => log.teacherId)))
        const teachers = teacherIds.length > 0 
            ? await db.query.profiles.findMany({
                where: inArray(schema.profiles.id, teacherIds)
            })
            : []
        
        // Create a map for quick teacher lookup
        const teacherMap = new Map(teachers.map(t => [t.id, t]))

        // Map logs with teacher names
        const logsWithTeacherNames = logs.map(log => {
            const teacher = teacherMap.get(log.teacherId)
            return {
                id: log.id,
                studentId: log.studentId,
                teacherId: log.teacherId,
                scoreChange: log.scoreChange,
                reason: log.reason,
                termId: log.termId,
                createdAt: log.createdAt?.toISOString() || new Date().toISOString(),
                teacherName: teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : 'Unknown'
            }
        })

        const studentName = `${student.prefix || ''} ${student.nameTh || ''} ${student.surnameTh || ''}`.trim()

        return c.json({
            studentId: student.studentId || student.id,
            studentName: studentName || 'Unknown Student',
            totalScore: student.conductScore || DEFAULT_CONDUCT_SCORE,
            history: logsWithTeacherNames.map(log => ({
                id: log.id,
                studentId: log.studentId,
                teacherId: log.teacherId,
                scoreChange: log.scoreChange,
                reason: log.reason,
                termId: log.termId,
                createdAt: log.createdAt,
            }))
        })
    } catch (error) {
        console.error('[GET /conduct/student/:studentId] Error:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

// POST /conduct/logs - Create new conduct log (teachers/affairs only)
const createLogRoute = createRoute({
    method: 'post',
    path: '/logs',
    summary: 'Create Conduct Log',
    description: 'Record a conduct score change (teachers/affairs only)',
    security: [{ Bearer: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateConductLogSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: ConductLogSchema,
                },
            },
            description: 'Log created successfully',
        },
        403: {
            description: 'Forbidden - Teacher/Affairs role required'
        },
        404: {
            description: 'Student not found'
        }
    },
})

app.openapi(createLogRoute, async (c) => {
    try {
        const user = c.get('user')
        
        if (!user || !user.id) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        // Check if user has teacher/affairs role
        const profile = await db.query.profiles.findFirst({
            where: eq(schema.profiles.id, user.id)
        })

        if (!profile) {
            return c.json({ 
                error: 'Forbidden - No profile found. Please ensure your user account is registered in the profiles table.',
                userId: user.id 
            }, 403)
        }

        if (!['teacher', 'admin', 'student_affairs'].includes(profile.role)) {
            return c.json({ 
                error: `Forbidden - Your role '${profile.role}' is not authorized. Required roles: teacher, admin, or student_affairs.`,
                currentRole: profile.role 
            }, 403)
        }

        const { studentId, scoreChange, reason } = c.req.valid('json')

        // Find student by studentId or CUID
        const student = await db.query.students.findFirst({
            where: or(
                eq(schema.students.studentId, studentId),
                eq(schema.students.id, studentId)
            )
        })

        if (!student) {
            return c.json({ error: 'Student not found' }, 404)
        }

        // Determine current term based on date
        const today = new Date()
        // We need to query terms to find which one matches today
        // This is a bit inefficient to query every time, but cacheing is out of scope for now
        const allTerms = await db.query.academicTerms.findMany()

        const currentTerm = allTerms.find(term => {
            const start = new Date(term.startDate)
            const end = new Date(term.endDate)
            end.setHours(23, 59, 59, 999)
            return today >= start && today <= end
        })

        // Create conduct log
        const [newLog] = await db.insert(schema.conductLogs).values({
            studentId: student.id,
            teacherId: user.id,
            scoreChange,
            reason,
            termId: currentTerm ? currentTerm.id : null
        }).returning()

        // Update student's conduct score
        const newScore = (student.conductScore || DEFAULT_CONDUCT_SCORE) + scoreChange
        await db.update(schema.students)
            .set({ conductScore: newScore })
            .where(eq(schema.students.id, student.id))

        return c.json({
            id: newLog.id,
            studentId: newLog.studentId,
            teacherId: newLog.teacherId,
            scoreChange: newLog.scoreChange,
            reason: newLog.reason,
            termId: newLog.termId,
            createdAt: newLog.createdAt?.toISOString() || new Date().toISOString(),
        })
    } catch (error) {
        console.error('[POST /conduct/logs] Error:', error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

export default app
