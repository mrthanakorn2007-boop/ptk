import { z } from '@hono/zod-openapi'

export const AcademicTermSchema = z.object({
    id: z.string().openapi({ example: 'cuid_term123' }),
    name: z.string().openapi({ example: '1/2567' }),
    startDate: z.string().openapi({ example: '2024-05-16' }),
    endDate: z.string().openapi({ example: '2024-10-10' }),
    type: z.enum(['term1', 'term2', 'summer', 'other']).openapi({ example: 'term1' }),
})

export const TermListResponseSchema = z.object({
    terms: z.array(AcademicTermSchema)
})

export const ConductLogSchema = z.object({
    id: z.string().openapi({ example: 'cuid_xyz123' }),
    studentId: z.string().openapi({ example: 'cuid_student123' }),
    teacherId: z.string().openapi({ example: 'uuid-teacher-123' }),
    scoreChange: z.number().openapi({ example: -5 }),
    reason: z.string().openapi({ example: 'มาสายเกิน 15 นาที' }),
    termId: z.string().nullable().optional().openapi({ example: 'cuid_term123' }),
    createdAt: z.string().openapi({ example: '2024-06-10T08:30:00Z' }),
})

export const ConductScoreResponseSchema = z.object({
    studentId: z.string().openapi({ example: '66001' }),
    studentName: z.string().openapi({ example: 'นายสมชาย ใจดี' }),
    totalScore: z.number().openapi({ example: 95 }),
    history: z.array(ConductLogSchema),
})

export const CreateConductLogSchema = z.object({
    studentId: z.string().min(1).openapi({ 
        example: 'cuid_student123',
        description: 'Student CUID or studentId'
    }),
    scoreChange: z.number().int().openapi({ 
        example: -5,
        description: 'Score change (negative for deduction, positive for addition)'
    }),
    reason: z.string().min(1).openapi({ 
        example: 'มาสายเกิน 15 นาที',
        description: 'Reason for score change'
    }),
})

export const StudentIdParamSchema = z.object({
    studentId: z.string().openapi({ 
        param: { 
            in: 'path', 
            name: 'studentId',
            description: 'Student CUID or public studentId' 
        }
    })
})

export const ConductFilterQuerySchema = z.object({
    termId: z.string().optional().openapi({
        param: {
            in: 'query',
            name: 'termId',
            description: 'Filter history by Academic Term ID'
        }
    })
})
