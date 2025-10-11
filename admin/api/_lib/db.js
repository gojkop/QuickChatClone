import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set for Admin project');
}

// Neon SQL tagged template (serverless-friendly)
export const sql = neon(process.env.DATABASE_URL);
