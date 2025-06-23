import mysql from "mysql2/promise";

let pool;

if (!global.pool) {
  global.pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });
}

pool = global.pool;

export const conexion = pool;