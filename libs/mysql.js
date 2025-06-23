import mysql from 'serverless-mysql';

export const conexion = mysql({
  config: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306,
  },
});
