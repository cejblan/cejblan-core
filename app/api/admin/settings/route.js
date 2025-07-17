import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

// Obtener todos los settings
export async function GET(req) {
  try {
    const [results] = await conexion.query("SELECT * FROM settings");
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Crear nuevo setting
export async function POST(request) {
  try {
    const description = await request.formData();
    const [result] = await conexion.query("INSERT INTO settings SET ?", {
      name: description.get("name"),
      description: description.get("description"),
      value: description.get("value"),
    });

    return NextResponse.json({
      name: description.get("name"),
      description: description.get("description"),
      value: description.get("value"),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Actualizar setting existente
export async function PUT(request) {
  const body = await request.json();
  const { name, value } = body;

  try {
    await conexion.query(
      "UPDATE settings SET value = ? WHERE name = ?",
      [value, name]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Eliminar setting por id
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ message: "Falta parámetro id" }, { status: 400 })
  }

  try {
    await conexion.query("DELETE FROM settings WHERE id = ?", [id])
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}