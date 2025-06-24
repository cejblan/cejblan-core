import { conexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.formData();

    const [result] = await conexion.query("INSERT INTO wishlist SET ?", {
      id: data.get("id"),
      customer: data.get("customer"),
    });

    return NextResponse.json({
      id: data.get("id"),
      customer: data.get("customer"),
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id, customer } = await req.json(); // Obtenemos los datos enviados en formato JSON
    // Consulta para eliminar registros que coincidan con el id y el customer
    const [result] = await conexion.query(
      "DELETE FROM wishlist WHERE id = ? AND customer = ?",
      [id, customer]
    );

    return NextResponse.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar registros de la wishlist:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
