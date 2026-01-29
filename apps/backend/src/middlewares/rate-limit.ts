import { Context, Next } from 'hono'
import { redis } from '../config/redis'

const WINDOW_SIZE_IN_SECONDS = 60
const MAX_WINDOW_REQUEST_COUNT = 100

export const rateLimiter = async (c: Context, next: Next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown-ip'
  
  try {
    const currentRequestCount = await redis.incr(ip)
    
    if (currentRequestCount === 1) {
      await redis.expire(ip, WINDOW_SIZE_IN_SECONDS)
    }
  
    if (currentRequestCount > MAX_WINDOW_REQUEST_COUNT) {
      return c.json({
        type: 'about:blank',
        title: 'Too Many Requests',
        status: 429,
        detail: 'You have exceeded the rate limit. Please try again later.',
        instance: c.req.path
      }, 429)
    }

    await next()
  } catch (error) {
    console.error('Rate Limiter Error:', error)
    // Fail open if Redis is down, don't block users
    await next()
  }
}
