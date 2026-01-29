import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import type { User } from '@supabase/supabase-js'

// Middlewares
import { errorHandler } from './middlewares/error'
import { rateLimiter } from './middlewares/rate-limit'
import { authMiddleware } from './middlewares/auth'

// Configuration
import { getSchoolConfig } from './config/school.config'

// Templates
import { generateLandingPage } from './templates/landing'

// Modules
import students from './modules/students/students.controller'
import conduct from './modules/conduct/conduct.controller'
import terms from './modules/conduct/term.controller'
import auth from './modules/auth/auth.controller'
import notifications from './modules/notifications/notifications.controller'

type Variables = {
  user: User
}

const app = new OpenAPIHono<{ Variables: Variables }>()

// Global Middlewares
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', secureHeaders())
app.use('*', rateLimiter)

// Global Error Handler
app.onError(errorHandler)

// Protected Routes
app.use('/students/*', authMiddleware)
app.use('/conduct/*', authMiddleware)
// Note: /notifications routes are protected individually in the controller
// /notifications/dashboard is public, all other routes require auth

// API Routes
app.route('/auth', auth)
app.route('/students', students)
app.route('/conduct', conduct)
app.route('/conduct', terms) // Mount term controller under /conduct (e.g., /conduct/terms)
app.route('/notifications', notifications)

// School Config API Endpoint
app.get('/config', (c) => {
  return c.json(getSchoolConfig())
})

// Landing Page with Dynamic API Endpoints
app.get('/', (c) => {
  return c.html(generateLandingPage())
})

// OpenAPI Documentation
const schoolConfig = getSchoolConfig()

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: `${schoolConfig.name.short.en}-Connext API`,
    description: schoolConfig.description.en,
    contact: {
      name: schoolConfig.name.en,
      email: schoolConfig.contact.email,
      url: schoolConfig.links.website
    }
  },
})

// Interactive API Reference (Scalar UI)
app.get('/reference', Scalar({
  spec: {
    url: '/doc',
  },
  theme: 'dark',
  customCss: `
    .scalar-app {
      --scalar-background-1: #000000;
      --scalar-background-2: #111111;
      --scalar-background-3: #1a1a1a;
      --scalar-color-1: #ffffff;
      --scalar-color-2: #cccccc;
      --scalar-color-accent: #22c55e;
    }
  `
}))

export default {
  port: 4001,
  fetch: app.fetch,
}
