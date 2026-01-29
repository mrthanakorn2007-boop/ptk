import { z } from '@hono/zod-openapi'

export const StudentSchema = z.object({
    id: z.string().openapi({ example: 'cuid_xyz123' }),
    studentId: z.string().nullable().openapi({ example: '642010001' }),
    citizenId: z.string().nullable().openapi({ example: '1100012345678' }),
    prefix: z.string().nullable().openapi({ example: 'Mr.' }),
    nameTh: z.string().nullable().openapi({ example: 'สมชาย' }),
    surnameTh: z.string().nullable().openapi({ example: 'ใจดี' }),
    nameEn: z.string().nullable().openapi({ example: 'Somchai' }),
    surnameEn: z.string().nullable().openapi({ example: 'Jaidee' }),
    class: z.number().nullable().openapi({ example: 4 }),
    room: z.number().nullable().openapi({ example: 1 }),
    number: z.string().nullable().openapi({ example: '15' }),
    house: z.string().nullable().openapi({ example: 'บ้าน 1' }),
    conductScore: z.number().default(150).openapi({ example: 150 }),
    email: z.string().nullable().openapi({ example: '642010001@schoolptk.ac.th' }),
})

export const StudentListResponseSchema = z.object({
    data: z.array(StudentSchema),
    meta: z.object({
        page: z.number().openapi({ example: 1 }),
        limit: z.number().openapi({ example: 10 }),
        total: z.number().openapi({ example: 100 }),
        totalPages: z.number().openapi({ example: 10 }),
    }),
})

export const StudentQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1).openapi({ param: { in: 'query', description: 'Page number' } }),
    limit: z.coerce.number().min(1).max(100).default(20).openapi({ param: { in: 'query', description: 'Items per page' } }),
    search: z.string().optional().openapi({ param: { in: 'query', description: 'Search to filter by studentId or name' } }),
})
