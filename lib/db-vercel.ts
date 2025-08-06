import { sql } from '@vercel/postgres'

// ฟังก์ชันสำหรับการ query
export async function executeQuery(query: string, params: any[] = []) {
  try {
    console.log("Executing query:", query, "with params:", params)
    const result = await sql.query(query, params)
    return { recordset: result.rows }
  } catch (err) {
    console.error("Query execution error:", err)
    throw err
  }
}

// ฟังก์ชันสำหรับการ query แบบ single row
export async function executeQuerySingle(query: string, params: any[] = []) {
  try {
    const { recordset } = await executeQuery(query, params)
    return recordset.length > 0 ? recordset[0] : null
  } catch (err) {
    console.error("Query execution error:", err)
    throw err
  }
}

// ฟังก์ชันสำหรับการ insert และ return ID
export async function executeInsert(query: string, params: any[] = []) {
  try {
    console.log("Executing insert:", query, "with params:", params)
    const result = await sql.query(query, params)
    return { insertId: result.rows[0]?.id || null }
  } catch (err) {
    console.error("Insert execution error:", err)
    throw err
  }
}