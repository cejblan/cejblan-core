import { NextResponse } from 'next/server'
import { conexion } from "@/libs/mysql";

export async function DELETE() {
  try {
    await conexion.query("TRUNCATE TABLE wishlist");
    return NextResponse.json({ message: "Tabla 'wishlist' truncada con éxito" });
  } catch (error) {
    console.error("Error truncando la tabla:", error);
    return NextResponse.json({ message: "Error al truncar la tabla" }, { status: 500 });
  } finally {
    await conexion.end(); // Asegúrate de cerrar la conexión
  }
}