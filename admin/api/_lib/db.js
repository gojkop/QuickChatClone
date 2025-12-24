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
// 1. Tagged template (parameterized) - PREFERRED:
//    await sql`SELECT * FROM users WHERE id = ${userId}`
//
// 2. Raw query with params (for dynamic ORDER BY, etc.) - use sql.query():
//    await sql.query('SELECT * FROM users WHERE id = $1 ORDER BY name ASC', [userId])
//
// 3. Unsafe interpolation (for trusted table/column names only):
//    await sql.unsafe(`SELECT * FROM ${tableName}`)

export default sql;