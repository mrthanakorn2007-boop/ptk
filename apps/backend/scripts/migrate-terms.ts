
import { db } from '../src/db';
import { academicTerms, conductLogs } from '../src/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

async function migrateTerms() {
    console.log('Starting migration for academic terms...');

    // 1. Define default academic terms (Thai Academic Year)
    // Adjust years as needed. Assuming 2567 (2024) and 2568 (2025) for now.
    // Term 1: May 16 - Oct 10
    // Term 2: Nov 1 - Mar 31
    // Summer/Break: Gaps between terms

    const termsToSeed = [
        {
            name: '1/2566',
            startDate: '2023-05-16',
            endDate: '2023-10-10',
            type: 'term1' as const
        },
        {
            name: '2/2566',
            startDate: '2023-11-01',
            endDate: '2024-03-31',
            type: 'term2' as const
        },
        {
            name: '1/2567',
            startDate: '2024-05-16',
            endDate: '2024-10-10',
            type: 'term1' as const
        },
        {
            name: '2/2567',
            startDate: '2024-11-01',
            endDate: '2025-03-31',
            type: 'term2' as const
        },
        {
            name: '1/2568',
            startDate: '2025-05-16',
            endDate: '2025-10-10',
            type: 'term1' as const
        },
        {
            name: '2/2568',
            startDate: '2025-11-01',
            endDate: '2026-03-31',
            type: 'term2' as const
        }
    ];

    console.log('Seeding academic terms...');

    const seededTerms = [];

    for (const term of termsToSeed) {
        // Check if term exists by name to avoid duplicates if re-run
        const existing = await db.query.academicTerms.findFirst({
            where: eq(academicTerms.name, term.name)
        });

        if (existing) {
            console.log(`Term ${term.name} already exists. Skipping insertion.`);
            seededTerms.push(existing);
        } else {
            const [newTerm] = await db.insert(academicTerms).values({
                id: createId(),
                ...term
            }).returning();
            console.log(`Created term ${term.name}`);
            seededTerms.push(newTerm);
        }
    }

    // 2. Add "Summer/Break" terms for gaps?
    // User requirement: "Assign these dates to a specific period labeled 'Semester Break' or 'Summer Break.'"
    // Let's dynamically create break terms if needed, or just a catch-all for now?
    // For simplicity, let's process logs and if they don't fit, create a break term for that year.
    // Actually, let's pre-define some breaks based on the gaps.

    // Gaps:
    // Apr 1 - May 15 (Summer Break)
    // Oct 11 - Oct 31 (Semester Break)

    const breaksToSeed = [
        { name: 'Summer 2566', startDate: '2023-04-01', endDate: '2023-05-15', type: 'summer' as const },
        { name: 'Break 1/2566', startDate: '2023-10-11', endDate: '2023-10-31', type: 'other' as const },
        { name: 'Summer 2567', startDate: '2024-04-01', endDate: '2024-05-15', type: 'summer' as const },
        { name: 'Break 1/2567', startDate: '2024-10-11', endDate: '2024-10-31', type: 'other' as const },
        { name: 'Summer 2568', startDate: '2025-04-01', endDate: '2025-05-15', type: 'summer' as const },
        { name: 'Break 1/2568', startDate: '2025-10-11', endDate: '2025-10-31', type: 'other' as const },
    ];

    for (const term of breaksToSeed) {
         const existing = await db.query.academicTerms.findFirst({
            where: eq(academicTerms.name, term.name)
        });

        if (existing) {
            seededTerms.push(existing);
        } else {
            const [newTerm] = await db.insert(academicTerms).values({
                id: createId(),
                ...term
            }).returning();
            console.log(`Created break term ${term.name}`);
            seededTerms.push(newTerm);
        }
    }

    // 3. Migrate existing Conduct Logs
    console.log('Migrating existing conduct logs...');

    // Fetch logs that don't have a termId
    const logsToMigrate = await db.query.conductLogs.findMany({
        where: isNull(conductLogs.termId)
    });

    console.log(`Found ${logsToMigrate.length} logs to migrate.`);

    let updatedCount = 0;

    for (const log of logsToMigrate) {
        const logDate = new Date(log.createdAt);

        // Find matching term
        const matchedTerm = seededTerms.find(term => {
            const start = new Date(term.startDate);
            const end = new Date(term.endDate);
            // Set end date to end of day for inclusive comparison
            end.setHours(23, 59, 59, 999);

            return logDate >= start && logDate <= end;
        });

        if (matchedTerm) {
            await db.update(conductLogs)
                .set({ termId: matchedTerm.id })
                .where(eq(conductLogs.id, log.id));
            updatedCount++;
        } else {
            console.warn(`Log ${log.id} at ${log.createdAt} did not match any defined term.`);
            // Optional: Create a generic "Unknown" or "Legacy" term if needed?
            // For now, leaving as null or we could assign to a default.
        }
    }

    console.log(`Successfully updated ${updatedCount} logs.`);
    console.log('Migration complete.');
    process.exit(0);
}

migrateTerms().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
