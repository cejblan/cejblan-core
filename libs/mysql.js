import mysql from 'serverless-mysql';

const db = mysql({
  config: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306,
  },
});

export const conexion = {
  async query(...args) {
    try {
      const results = await db.query(...args);
      const fields = []; // Simula el segundo elemento de mysql2
      return [results, fields];
    } finally {
      await db.end();
    }
  }
};