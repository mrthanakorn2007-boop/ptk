import { z } from '@hono/zod-openapi'

export const NotificationSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
    externalUrl: z.string().nullable(),
    type: z.enum(['urgent', 'general', 'event']),
    targetAudience: z.enum(['all', 'students', 'teachers']),
    createdBy: z.string().nullable(),
    createdAt: z.string(),
})

export const CreateNotificationSchema = z.object({
    title: z.string().min(1).max(200).openapi({ example: 'Important Announcement' }),
    content: z.string().min(1).openapi({ example: 'School will be closed tomorrow.' }),
    description: z.string().optional().openapi({ example: 'Detailed information about the announcement...' }),
    imageUrl: z.string().optional().openapi({ example: 'https://example.com/image.jpg' }),
    externalUrl: z.string().optional().openapi({ example: 'https://example.com/resource' }),
    type: z.enum(['urgent', 'general', 'event']).openapi({ example: 'urgent' }),
    targetAudience: z.enum(['all', 'students', 'teachers']).openapi({ example: 'all' }),
})

export const UpdateNotificationSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    externalUrl: z.string().optional(),
    type: z.enum(['urgent', 'general', 'event']).optional(),
    targetAudience: z.enum(['all', 'students', 'teachers']).optional(),
})

export const NotificationListResponseSchema = z.object({
    data: z.array(NotificationSchema),
    total: z.number(),
})

export const ErrorResponseSchema = z.object({
    error: z.string(),
})
