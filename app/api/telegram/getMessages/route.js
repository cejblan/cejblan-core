import { conexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "chatId faltante" }, { status: 400 });
    }

    const [rows] = await conexion.query(
      "SELECT text, from_bot, created_at FROM telegram_messages WHERE chat_id = ? ORDER BY created_at ASC",
      [chatId]
    );

    return NextResponse.json(rows); // ✅ correcto
  } catch (error) {
    console.error("Error en getMessages:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}