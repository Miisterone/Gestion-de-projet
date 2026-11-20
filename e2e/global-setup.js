// Applies the migrations on the E2E database and empties it
import { execSync } from 'child_process';
import pg from 'pg';

const DATABASE_URL =
  process.env.E2E_DATABASE_URL || 'postgres://localloop:localloop@localhost:5432/localloop_e2e';

export default async function setup() {
  execSync('npx prisma migrate deploy', { cwd: 'backend', env: { ...process.env, DATABASE_URL }, stdio: 'pipe' });

  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  await client.query(
    'truncate table reports, events, likes, comments, posts, users restart identity cascade'
  );
  await client.end();
}
