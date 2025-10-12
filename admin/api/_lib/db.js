// admin/api/_lib/db.js
// Neon database connection

import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create neon client
// The neon() function returns a query function that can be called directly
export const sql = neon(DATABASE_URL);

// Usage examples:
// 
// 1. Tagged template (parameterized):
//    await sql`SELECT * FROM users WHERE id = ${userId}`
//
// 2. Raw query with params (what we need for dynamic ORDER BY):
//    await sql('SELECT * FROM users WHERE id = $1 ORDER BY name ASC', [userId])
//
// 3. Raw query without params:
//    await sql('SELECT * FROM users ORDER BY created_at DESC')

export default sql;