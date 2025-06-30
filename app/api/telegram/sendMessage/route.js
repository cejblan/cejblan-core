import { NextResponse } from "next/server";

export async function POST(request) {
  const { chat_id, text } = await request.json();
  const token = process.env.BOT_TOKEN;

  if (!token || !chat_id || !text) {
    return NextResponse.json({
      status: "error",
      message: "Datos faltantes o token no configurado",
    });
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id,
    text,
    parse_mode: "HTML",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json({
        status: "error",
        message: data.description || "Fallo en la API de Telegram",
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Mensaje enviado correctamente",
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return NextResponse.json({
      status: "error",
      message: "Error al conectar con Telegram",
    });
  }
}