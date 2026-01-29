import { Queue, Worker } from 'bullmq'
import { env } from '../../config/env'
import { db } from '../../db'
// import { notifications } from '../../db/schema'

const QUEUE_NAME = 'notifications'

// Connect to Redis
const connection = {
  url: env.REDIS_URL
}

export const notificationQueue = new Queue(QUEUE_NAME, { connection })

// Worker to process jobs
export const notificationWorker = new Worker(QUEUE_NAME, async (job) => {
  console.log(`Processing notification job: ${job.id}`)
  const { title, content, type, targetAudience } = job.data

  try {
    // 1. Simulate "Broadcast" delay (real logic would involve Push Notifications / Websockets)
    await new Promise(resolve => setTimeout(resolve, 100)) 

    // 2. Save to DB (Persistent storage)
    // Notification table removed in schema refactor
    /*
    await db.insert(notifications).values({
      title,
      content,
      type,
      targetAudience
      // id, date auto-generated
    })
    */
    
    console.log(`Notification sent (DB save skipped): ${title}`)
  } catch (error) {
    console.error('Failed to process notification:', error)
    throw error
  }
}, { connection, concurrency: 5 }) // Process 5 jobs at once (Scalability)
