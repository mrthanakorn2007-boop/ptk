import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    const students = await db.query.students.findMany({ limit: 5 });
    console.log('Sample Students (Citizen IDs):');
    students.forEach(s => {
        console.log(`Student ${s.studentId}: ${s.citizenId}`);
    });

    // Check format
    const anyUnencrypted = students.some(s => s.citizenId && s.citizenId.split(':').length !== 3);
    if (anyUnencrypted) {
        console.error('❌ Found unencrypted data!');
    } else {
        console.log('✅ All samples appear encrypted.');
    }
    process.exit(0);
}

main();
