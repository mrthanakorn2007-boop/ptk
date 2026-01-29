import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import type { User } from '@supabase/supabase-js'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import {
    NotificationSchema,
    CreateNotificationSchema,
    UpdateNotificationSchema,
    NotificationListResponseSchema,
    ErrorResponseSchema,
} from './notifications.schema'
import { authMiddleware } from '../../middlewares/auth'

type Variables = {
    user: User
}

const app = new OpenAPIHono<{ Variables: Variables }>()

// GET /notifications/dashboard - Get all notifications for dashboard widget
const getDashboardRoute = createRoute({
    method: 'get',
    path: '/dashboard',
    summary: 'Get dashboard notifications',
    description: 'Returns all urgent/latest notifications for the dashboard widget',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: NotificationListResponseSchema,
                },
            },
            description: 'Success',
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Internal server error',
        },
    },
})

app.openapi(getDashboardRoute, async (c) => {
    try {
        const notifications = await db
            .select()
            .from(schema.notifications)
            .orderBy(desc(schema.notifications.createdAt))

        return c.json({
            data: notifications.map((n) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                description: n.description || null,
                imageUrl: n.imageUrl || null,
                externalUrl: n.externalUrl || null,
                type: n.type as 'urgent' | 'general' | 'event',
                targetAudience: n.targetAudience as 'all' | 'students' | 'teachers',
                createdBy: n.createdBy || null,
                createdAt: n.createdAt?.toISOString() || new Date().toISOString(),
            })),
            total: notifications.length,
        }, 200)
    } catch (error) {
        console.error('[Notifications] Error fetching dashboard notifications:', error)
        return c.json({ error: 'Failed to fetch notifications' }, 500)
    }
})

// GET /notifications - Get all notifications (paginated)
const getAllRoute = createRoute({
    method: 'get',
    path: '/',
    summary: 'Get all notifications',
    description: 'Returns paginated list of notifications',
    middleware: [authMiddleware] as any,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: NotificationListResponseSchema,
                },
            },
            description: 'Success',
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Unauthorized',
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Internal server error',
        },
    },
})

app.openapi(getAllRoute, async (c) => {
    try {
        const notifications = await db
            .select()
            .from(schema.notifications)
            .orderBy(desc(schema.notifications.createdAt))

        return c.json({
            data: notifications.map((n) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                description: n.description || null,
                imageUrl: n.imageUrl || null,
                externalUrl: n.externalUrl || null,
                type: n.type as 'urgent' | 'general' | 'event',
                targetAudience: n.targetAudience as 'all' | 'students' | 'teachers',
                createdBy: n.createdBy || null,
                createdAt: n.createdAt?.toISOString() || new Date().toISOString(),
            })),
            total: notifications.length,
        }, 200)
    } catch (error) {
        console.error('[Notifications] Error fetching notifications:', error)
        return c.json({ error: 'Failed to fetch notifications' }, 500)
    }
})

// POST /notifications - Create notification (Admin only)
const createNotificationRoute = createRoute({
    method: 'post',
    path: '/',
    summary: 'Create notification',
    description: 'Create a new notification (Admin only)',
    middleware: [authMiddleware] as any,
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateNotificationSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: NotificationSchema,
                },
            },
            description: 'Created',
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Unauthorized',
        },
        403: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Forbidden - Admin role required',
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Internal server error',
        },
    },
})

app.openapi(createNotificationRoute, async (c) => {
    try {
        const user = c.get('user')
        
        // Check if user has admin role
        const profile = await db.query.profiles.findFirst({
            where: eq(schema.profiles.id, user.id),
        })

        if (!profile || profile.role !== 'admin') {
            return c.json({
                error: 'Forbidden - Admin role required',
            }, 403)
        }

        const { title, content, description, imageUrl, externalUrl, type, targetAudience } = c.req.valid('json')

        const [notification] = await db
            .insert(schema.notifications)
            .values({
                title,
                content,
                description: description || null,
                imageUrl: imageUrl || null,
                externalUrl: externalUrl || null,
                type,
                targetAudience,
                createdBy: user.id,
            })
            .returning()

        return c.json(
            {
                id: notification.id,
                title: notification.title,
                content: notification.content,
                description: notification.description || null,
                imageUrl: notification.imageUrl || null,
                externalUrl: notification.externalUrl || null,
                type: notification.type as 'urgent' | 'general' | 'event',
                targetAudience: notification.targetAudience as 'all' | 'students' | 'teachers',
                createdBy: notification.createdBy || null,
                createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
            },
            201
        )
    } catch (error) {
        console.error('[Notifications] Error creating notification:', error)
        return c.json({ error: 'Failed to create notification' }, 500)
    }
})

// PUT /notifications/:id - Update notification (Admin only)
const updateRoute = createRoute({
    method: 'put',
    path: '/{id}',
    summary: 'Update notification',
    description: 'Update an existing notification (Admin only)',
    middleware: [authMiddleware] as any,
    request: {
        params: NotificationSchema.pick({ id: true }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateNotificationSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: NotificationSchema,
                },
            },
            description: 'Updated',
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Unauthorized',
        },
        403: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Forbidden',
        },
        404: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Not found',
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Internal server error',
        },
    },
})

app.openapi(updateRoute, async (c) => {
    try {
        const user = c.get('user')
        const { id } = c.req.param()

        // Check if user has admin role
        const profile = await db.query.profiles.findFirst({
            where: eq(schema.profiles.id, user.id),
        })

        if (!profile || profile.role !== 'admin') {
            return c.json({ error: 'Forbidden - Admin role required' }, 403)
        }

        const updates = c.req.valid('json')

        const [notification] = await db
            .update(schema.notifications)
            .set(updates)
            .where(eq(schema.notifications.id, id))
            .returning()

        if (!notification) {
            return c.json({ error: 'Notification not found' }, 404)
        }

        return c.json({
            id: notification.id,
            title: notification.title,
            content: notification.content,
            description: notification.description || null,
            imageUrl: notification.imageUrl || null,
            externalUrl: notification.externalUrl || null,
            type: notification.type as 'urgent' | 'general' | 'event',
            targetAudience: notification.targetAudience as 'all' | 'students' | 'teachers',
            createdBy: notification.createdBy || null,
            createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
        }, 200)
    } catch (error) {
        console.error('[Notifications] Error updating notification:', error)
        return c.json({ error: 'Failed to update notification' }, 500)
    }
})

// DELETE /notifications/:id - Delete notification (Admin only)
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    summary: 'Delete notification',
    description: 'Delete a notification (Admin only)',
    middleware: [authMiddleware] as any,
    request: {
        params: NotificationSchema.pick({ id: true }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({ message: z.string() }),
                },
            },
            description: 'Deleted',
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Unauthorized',
        },
        403: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Forbidden',
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Internal server error',
        },
    },
})

app.openapi(deleteRoute, async (c) => {
    try {
        const user = c.get('user')
        const { id } = c.req.param()

        // Check if user has admin role
        const profile = await db.query.profiles.findFirst({
            where: eq(schema.profiles.id, user.id),
        })

        if (!profile || profile.role !== 'admin') {
            return c.json({ error: 'Forbidden - Admin role required' }, 403)
        }

        await db
            .delete(schema.notifications)
            .where(eq(schema.notifications.id, id))

        return c.json({ message: 'Notification deleted successfully' }, 200)
    } catch (error) {
        console.error('[Notifications] Error deleting notification:', error)
        return c.json({ error: 'Failed to delete notification' }, 500)
    }
})

export default app
