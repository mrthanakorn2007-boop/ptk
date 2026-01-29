import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { LoginRequestSchema, LoginResponseSchema, ErrorResponseSchema } from './auth.schema'
import { supabase } from '../../libs/supabase'

const app = new OpenAPIHono()

// Helper function to check if string is an email
const isEmail = (str: string): boolean => {
    return str.includes('@') && str.includes('.')
}

// POST /auth/login - Hybrid login endpoint
const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    summary: 'Hybrid Login (Student or Teacher)',
    description: 'Login endpoint that handles both student and teacher authentication. If studentId contains an email, treats it as teacher login.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: LoginResponseSchema,
                },
            },
            description: 'Login successful',
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
            description: 'Invalid credentials',
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

app.openapi(loginRoute, async (c) => {
    try {
        const { studentId, citizenId } = c.req.valid('json')
        
        let email: string
        let password: string
        
        // Hybrid Input Handling
        if (isEmail(studentId)) {
            // Teacher/Staff login: studentId is email, citizenId is password
            email = studentId
            password = citizenId
            console.log('[Login] Teacher login detected:', { email })
        } else {
            // Student login: construct email from studentId, citizenId is password
            email = `${studentId}@schoolptk.ac.th`
            password = citizenId
            console.log('[Login] Student login detected:', { studentId, email })
        }
        
        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        
        if (error) {
            console.error('[Login] Authentication failed:', error.message)
            return c.json({ 
                error: 'Invalid credentials',
                details: error.message 
            }, 401)
        }
        
        if (!data.user || !data.session) {
            return c.json({ 
                error: 'Authentication failed',
                details: 'No user or session returned' 
            }, 401)
        }
        
        console.log('[Login] Login successful:', { 
            userId: data.user.id, 
            email: data.user.email 
        })
        
        return c.json({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: {
                id: data.user.id,
                email: data.user.email || '',
                role: data.user.user_metadata?.role,
            },
        }, 200)
    } catch (error) {
        console.error('[Login] Unexpected error:', error)
        return c.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})

export default app
