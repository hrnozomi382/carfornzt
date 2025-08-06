import mysql from "mysql2/promise"

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "carbookingsystem",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
}

let pool: mysql.Pool | null = null

async function getPool() {
  if (!pool) {
    try {
      console.log("Creating database pool")
      pool = mysql.createPool(dbConfig)
      const connection = await pool.getConnection()
      connection.release()
      console.log("Database pool created successfully")
    } catch (error) {
      console.error("Error creating database pool:", error)
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return pool
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const pool = await getPool()
    const [rows] = await pool.execute(query, params)
    return { recordset: rows }
  } catch (err) {
    console.error("Query execution error:", err)
    throw err
  }
}

export async function executeQuerySingle(query: string, params: any[] = []) {
  try {
    const { recordset } = await executeQuery(query, params)
    const rows = recordset as any[]
    return rows.length > 0 ? rows[0] : null
  } catch (err) {
    console.error("Query execution error:", err)
    throw err
  }
}

export async function executeInsert(query: string, params: any[] = []) {
  try {
    const pool = await getPool()
    const [result] = await pool.execute(query, params)
    const insertId = (result as any).insertId
    return { insertId }
  } catch (err) {
    console.error("Insert execution error:", err)
    throw err
  }
}
