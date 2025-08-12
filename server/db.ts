import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Initialize Netlify DB connection
export const sql = neon();
export const db = drizzle(sql, { schema });
