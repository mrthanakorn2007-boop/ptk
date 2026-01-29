
import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { TermListResponseSchema } from './conduct.schema'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { desc } from 'drizzle-orm'

const app = new OpenAPIHono()

// GET /conduct/terms - Get list of academic terms
const getTermsRoute = createRoute({
    method: 'get',
    path: '/terms',
    summary: 'Get Academic Terms',
    description: 'Retrieve list of all academic terms (semesters)',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: TermListResponseSchema,
                },
            },
            description: 'Successful response',
        },
    },
})

app.openapi(getTermsRoute, async (c) => {
    try {
        const terms = await db.query.academicTerms.findMany({
            orderBy: [desc(schema.academicTerms.startDate)],
        })

        return c.json({
            terms: terms.map(t => ({
                id: t.id,
                name: t.name,
                startDate: t.startDate,
                endDate: t.endDate,
                type: t.type
            }))
        })
    } catch (error) {
        console.error('[GET /conduct/terms] Error:', error)
        return c.json({ terms: [] }, 500)
    }
})

export default app
