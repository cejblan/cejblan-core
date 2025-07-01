import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function POST(req) {
  try {
    const { chat_id, text } = await req.json();

    if (!chat_id || !text) {
      return NextResponse.json(
        { status: "error", message: "Faltan parámetros chat_id o text" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text }),
      }
    );
    const data = await telegramResponse.json();

    if (!data.ok) {
      throw new Error(data.description || "No se pudo enviar el mensaje a Telegram");
    }

    await conexion.query(
      "INSERT INTO telegram_messages (chat_id, text, from_bot, created_at) VALUES (?, ?, ?, NOW())",
      [chat_id, text, 1]
    );

    return NextResponse.json({
      status: "success",
      message: "Mensaje enviado y guardado correctamente",
    });
  } catch (error) {
    console.error("Error en sendMessage:", error);
    return NextResponse.json(
      { status: "error", message: "Error al enviar el mensaje" },
      { status: 500 }
    );
  }
}