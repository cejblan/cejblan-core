import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

// Obtener todos los settings
export async function GET(req) {
  const connection = await conexion.getConnection();
  try {
    const [results] = await connection.query("SELECT * FROM settings");
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

// Crear nuevo setting
export async function POST(request) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();
    const [result] = await connection.query("INSERT INTO settings SET ?", {
      name: data.get("name"),
      description: data.get("description"),
      value: data.get("value"),
    });

    return NextResponse.json({
      name: data.get("name"),
      description: data.get("description"),
      value: data.get("value"),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

// Actualizar setting existente
export async function PUT(request) {
  const connection = await conexion.getConnection();
  try {
    const body = await request.json();
    const { name, value } = body;

    await connection.query(
      "UPDATE settings SET value = ? WHERE name = ?",
      [value, name]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}