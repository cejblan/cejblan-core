import { conexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const customer = new URL(req.url).searchParams.get("customerEmail");
  const { id } = params; // Obtener el id desde los parámetros de la ruta dinámica

  try {
    if (!id || !customer) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    // Consulta para verificar si el producto ya está en la wishlist
    const [rows] = await conexion.query(
      "SELECT * FROM wishlist WHERE id = ? AND customer = ?",
      [id, customer]
    );

    return NextResponse.json({ rows }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache', // Compatibilidad con navegadores antiguos
        'Expires': '0', // Fecha de expiración ya pasada
      }
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
