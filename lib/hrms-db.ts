import mysql from "mysql2/promise";

const hrmsPool = mysql.createPool({
  host: process.env.DB_READONLY_HOST,
  port: parseInt(process.env.DB_READONLY_PORT || "3306"),
  database: process.env.DB_READONLY_DATABASE,
  user: process.env.DB_READONLY_USERNAME,
  password: process.env.DB_READONLY_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function queryHrms(sql: string, params?: any[]) {
  try {
    const [rows] = await hrmsPool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("HRMS DB Query Error:", error);
    throw error;
  }
}
