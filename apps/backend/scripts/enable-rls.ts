import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
    console.log('🛡️ Enabling RLS on students table...');

    // Enable RLS
    await db.execute(sql`ALTER TABLE students ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS Enabled.');

    // Optional: Create Policy for Service Role (implicitly has access usually, but good to be explicit or if we want to allow specific access)
    // For now, enabling RLS denies default access to public/anon.

    // Let's create a policy that DENIES everything to anon/authenticated by default (implicit)
    // But strictly, we might want to allow "service_role" explicitly if using supabase client with service key?
    // Postgres user defined in DATABASE_URL acts as owner/superuser usually on Supabase, so it bypasses RLS.

    console.log('🔒 Access restricted to Superuser/Owner (Backend) only check.');

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
