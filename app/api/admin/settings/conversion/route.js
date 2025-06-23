import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET() {
  const connection = await conexion.getConnection();
  try {
    const [setting] = await connection.query(
      "SELECT value FROM settings WHERE name = 'activar_conversion_bs' LIMIT 1"
    );
    return NextResponse.json({ activa: setting?.[0]?.value === '1' });
  } catch (error) {
    console.error("Error al obtener setting:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function PUT(req) {
  const connection = await conexion.getConnection();
  try {
    const { activa } = await req.json(); // true/false
    await connection.query(
      "UPDATE settings SET value = ? WHERE name = 'activar_conversion_bs'",
      [activa ? '1' : '0']
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar setting:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}