import mysql from "serverless-mysql"

export const conexion = mysql({
    config: {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        port: 3306,
        database: process.env.DATABASE,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 10,
    }
})