import { NextResponse } from 'next/server';
import { conexion } from "@/libs/mysql";

export async function GET(req, res) {
  try {
    const [tasas] = await conexion.query("SELECT * FROM coins");
    return NextResponse.json({ tasas });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.formData();
    const moneda = data.get("moneda");
    const valor = data.get("valor");

    // Verificar si ya existe una tasa para esa moneda
    const [existente] = await conexion.query("SELECT id FROM coins WHERE moneda = ?", [moneda]);

    if (existente.length > 0) {
      await conexion.query(
        "UPDATE coins SET valor = ?, fecha = NOW() WHERE id = ?",
        [valor, existente[0].id]
      );
    } else {
      await conexion.query(
        "INSERT INTO coins (moneda, valor) VALUES (?, ?)",
        [moneda, valor]
      );
    }

    return NextResponse.json({ moneda, valor });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}