import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt, decrypt } from '../src/utils/encryption';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    console.log('🔒 Starting encryption migration for Citizen IDs...');

    const allStudents = await db.query.students.findMany();
    console.log(`Found ${allStudents.length} students.`);

    let updatedCount = 0;
    let alreadyEncryptedCount = 0;

    for (const student of allStudents) {
        if (!student.citizenId) continue;

        const currentId = student.citizenId;

        // Check if already encrypted (contains 2 colons and is hex-ish)
        if (currentId.split(':').length === 3) {
            try {
                // Validation check
                decrypt(currentId);
                alreadyEncryptedCount++;
                continue;
            } catch (e) {
                // If decrypt fails, maybe it's just a text that looks like it? assume clean text.
                console.warn(`⚠️ Warning: ID ${student.id} has format resembling encrypted but failed decryption. Re-encrypting.`);
            }
        }

        const encryptedId = encrypt(currentId);

        await db.update(schema.students)
            .set({ citizenId: encryptedId })
            .where(eq(schema.students.id, student.id));

        updatedCount++;
        if (updatedCount % 100 === 0) {
            console.log(`.. processed ${updatedCount}`);
        }
    }

    console.log(`✅ Migration complete.`);
    console.log(`   - Encrypted: ${updatedCount}`);
    console.log(`   - Skipped (Already Encrypted): ${alreadyEncryptedCount}`);

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
