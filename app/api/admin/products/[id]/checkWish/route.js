import { conexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  const customer = new URL(req.url).searchParams.get("customerEmail");
  const { id } = context.params;

  const connection = await conexion.getConnection();
  try {
    if (!id || !customer) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const [rows] = await connection.query(
      "SELECT * FROM wishlist WHERE id = ? AND customer = ?",
      [id, customer]
    );

    return NextResponse.json(
      { rows },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  } finally {
    connection.release();
  }
}