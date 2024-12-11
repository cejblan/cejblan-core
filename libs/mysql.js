import mysql from 'serverless-mysql'

export const conexion2 = mysql({
    config: {
        host: process.env.HOST2,
        user: process.env.USER2,
        password: process.env.PASSWORD2,
        port: 3306,
        database: process.env.DATABASE2,
        waitForConnections: true,
        connectionLimit: 15,  // Máximo número de conexion2es simultáneas
        queueLimit: 0,        // No limitamos la cantidad de conexion2es en espera
    }
})

export const conexion3 = mysql({
    config: {
        host: process.env.HOST3,
        user: process.env.USER3,
        password: process.env.PASSWORD3,
        port: 3306,
        database: process.env.DATABASE3,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
    }
})