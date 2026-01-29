import { z } from 'zod'
import { config } from 'dotenv'

config() // Load .env

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
