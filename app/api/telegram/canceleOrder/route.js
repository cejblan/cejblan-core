import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { conexion } from "@/libs/mysql"; // Asegúrate de tener esto configurado correctamente

export async function POST(request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const data = await request.json();
  // Verificar que los datos necesarios estén presentes
  if (!data.dataOrder.chatId || !data.dataOrder.id || !data.dataOrder.status) {
    return NextResponse.json({
      status: "error",
      message: "Datos incompletos para procesar la solicitud.",
    });
  }
  // Construir enlaces a los productos

  const chatId = data.dataOrder.chatId;
  const message = `<b>Hemos actualizado el estado de tu pedido <a href="${siteUrl}/orders">#${data.dataOrder.id}</a> como:</b>

⏳ Estado: ${data.dataOrder.status}

Nos disculpamos si hubo algún problema durante su proceso de compra 😓. En cualquier caso, estaremos disponibles nuevamente para atenderle en todo lo que necesite 😉.`;

  const token = process.env.BOT_TOKEN;

  if (!token) {
    console.error("BOT_TOKEN no está configurado.");
    return NextResponse.json({
      status: "error",
      message: "Error del servidor. BOT_TOKEN no está configurado.",
    });
  }
  // Enviar mensaje a Telegram
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("Error al enviar el mensaje:", response.statusText);
    return NextResponse.json({
      status: "error",
      message: "No se pudo enviar el mensaje a Telegram.",
    });
  }
  // Guardar el mensaje enviado en la base de datos (tabla telegram_messages)
  try {
    await conexion.query(
      `INSERT INTO telegram_messages (chat_id, text, from_bot) VALUES (?, ?, ?)`,
      [chatId, message, 1] // from_bot = 1 porque fue enviado por el bot
    );
  } catch (error) {
    console.error("Error al guardar el mensaje en telegram_messages:", error);
    return NextResponse.json({
      status: "error",
      message: "Mensaje enviado, pero no se pudo guardar en la base de datos.",
    });
  }
  return NextResponse.json({
    status: "success",
    message: "Mensaje enviado a Telegram y guardado correctamente.",
  });
}