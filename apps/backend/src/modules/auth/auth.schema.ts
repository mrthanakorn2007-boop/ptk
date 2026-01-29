import { z } from '@hono/zod-openapi'

export const LoginRequestSchema = z.object({
    studentId: z.string().min(1).openapi({ 
        example: '65001',
        description: 'Student ID or Email address'
    }),
    citizenId: z.string().min(1).openapi({ 
        example: '1234567890123',
        description: 'Citizen ID (for students) or Password (for teachers/staff)'
    }),
})

export const LoginResponseSchema = z.object({
    accessToken: z.string().openapi({ example: 'eyJhbGc...' }),
    refreshToken: z.string().openapi({ example: 'eyJhbGc...' }),
    user: z.object({
        id: z.string(),
        email: z.string(),
        role: z.string().optional(),
    }),
})

export const ErrorResponseSchema = z.object({
    error: z.string(),
    details: z.string().optional(),
})
