import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sistem_helpdesk_nlp",
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === "production" ? 3 : 10,
  queueLimit: 0,
  connectTimeout: 10000,
})

export async function query(sql: string, values?: any[]) {
  const connection = await pool.getConnection()
  try {
    const [results] = await connection.execute(sql, values)
    return results
  } finally {
    connection.release()
  }
}

export default pool
