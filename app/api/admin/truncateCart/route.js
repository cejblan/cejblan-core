import { NextResponse } from 'next/server';
import { conexion } from "@/libs/mysql";

export async function DELETE() {
  const connection = await conexion.getConnection();
  try {
    await connection.query("TRUNCATE TABLE cart");
    return NextResponse.json({ message: "Tabla 'cart' truncada con éxito" });
  } catch (error) {
    console.error("Error truncando la tabla:", error);
    return NextResponse.json({ message: "Error al truncar la tabla" }, { status: 500 });
  } finally {
    connection.release();
  }
}