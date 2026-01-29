
import { createMiddleware } from 'hono/factory'
import { supabase } from '../libs/supabase'
import { HTTPException } from 'hono/http-exception'

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader) {
    throw new HTTPException(401, { message: 'Missing Authorization Header' })
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw new HTTPException(401, { message: 'Invalid or Expired Token' })
    }

    c.set('user', user)
    await next()
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err
    }
    throw new HTTPException(401, { message: 'Authentication failed' })
  }
})
