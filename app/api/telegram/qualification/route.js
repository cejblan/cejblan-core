import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request) {
  const data = await request.json();
  if (!data.dataOrder.chatId || !data.dataOrder.id || !data.dataOrder.status) {
    return NextResponse.json({
      status: "error",
      message: "Datos incompletos para procesar la solicitud.",
    });
  }

  const products = data.dataOrder.productsIds
  .split(",") // Convertir la cadena en un array
  .map((id) => ` ✅ <a href="https://www.cejblan.com/products/${id}/qualification">👉🏻${id}👈🏻</a>`)
  .join("\n");
  const chatId = data.dataOrder.chatId;
  const message = `<b>Hemos actualizado el estado de tu pedido <a href="https://www.cejblan.com/orders">#${data.dataOrder.id}</a> como:</b>

⏳ Estado: ${data.dataOrder.status}

Te invitamos a calificar la calidad de los productos:
${products}`;

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
  return NextResponse.json({
    status: "success",
    message: "Mensaje enviado a Telegram correctamente.",
  });
}