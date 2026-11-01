import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://pravah:pravah@localhost:5432/pravah',
  max: 2,
});

try {
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' });
  console.log('[migrate] done');
} finally {
  await pool.end();
}
