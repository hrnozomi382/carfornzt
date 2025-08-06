import mysql from "mysql2/promise"

// Check environment to determine database type
const isVercel = process.env.VERCEL === '1'
const usePostgres = process.env.POSTGRES_URL !== undefined

if (isVercel && usePostgres) {
  // Use Vercel Postgres
  export * from './vercel-db'
} else {
  // Use MySQL (local or production)
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
        console.log("Creating database pool with config:", {
          host: dbConfig.host,
          user: dbConfig.user,
          database: dbConfig.database,
        })
        pool = mysql.createPool(dbConfig)
        
        const connection = await pool.getConnection()
        connection.release()
        console.log("Database pool created and tested successfully")
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
      console.log("Executing query:", query, "with params:", params)
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
      console.log("Executing insert:", query, "with params:", params)
      const [result] = await pool.execute(query, params)
      const insertId = (result as any).insertId
      return { insertId }
    } catch (err) {
      console.error("Insert execution error:", err)
      throw err
    }
  }
}
