import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req) {
  try {
    // Extraer query param 'role' si quieres hacerlo dinámico (opcional)
    const url = new URL(req.url);
    const role = url.searchParams.get("role") || "delivery"; // default a delivery

    const [result] = await conexion.query("SELECT * FROM users WHERE rol = ?", [role]);

    if (result.length === 0) {
      return NextResponse.json({ message: "No se encontraron usuarios con rol: " + role }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 }); // devolver todos los usuarios
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
