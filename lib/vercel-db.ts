import { sql } from '@vercel/postgres'

export { sql }

// Helper functions for common database operations
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql.query(query, params)
    return { recordset: result.rows }
  } catch (err) {
    console.error('Query execution error:', err)
    throw err
  }
}

export async function executeQuerySingle(query: string, params: any[] = []) {
  try {
    const { recordset } = await executeQuery(query, params)
    return recordset.length > 0 ? recordset[0] : null
  } catch (err) {
    console.error('Query execution error:', err)
    throw err
  }
}

export async function executeInsert(query: string, params: any[] = []) {
  try {
    const result = await sql.query(query, params)
    return { insertId: result.rows[0]?.id || null }
  } catch (err) {
    console.error('Insert execution error:', err)
    throw err
  }
}