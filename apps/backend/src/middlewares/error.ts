import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'

export const errorHandler = (err: Error, c: Context) => {
  console.error('Global Error Exception:', err)

  if (err instanceof HTTPException) {
    return c.json({
      type: 'about:blank',
      title: 'HTTP Exception',
      status: err.status,
      detail: err.message,
      instance: c.req.path
    }, err.status)
  }

  if (err instanceof ZodError) {
    const issues = err.issues || []
    return c.json({
      type: 'about:blank',
      title: 'Validation Error',
      status: 400,
      detail: 'Request validation failed',
      errors: issues,
      instance: c.req.path
    }, 400)
  }

  return c.json({
    type: 'about:blank',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred. Please try again later.',
    instance: c.req.path
  }, 500)
}
