import { conexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [users] = await conexion.query(
      "SELECT chatId, name FROM users WHERE chatId IS NOT NULL"
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ status: "error", message: "Error interno" });
  }
}