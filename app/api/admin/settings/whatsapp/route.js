import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET() {
  try {
    const [result] = await conexion.query(
      "SELECT value FROM settings WHERE name = 'whatsapp' LIMIT 1"
    );
    return NextResponse.json({ value: result[0]?.value || null });
  } catch (error) {
    console.error("Error al obtener número WhatsApp:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
