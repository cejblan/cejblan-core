import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { conexion } from "@/libs/mysql"; // Asegúrate de que esté bien configurado

export async function POST(request) {
  const data = await request.json();
  const moment = require("moment");
  // Formatear la fecha con ajuste de zona horaria
  const date = moment(data.dataOrder.date).subtract(4, "hours").format("DD/MM/YYYY");
  // Verificar que los datos necesarios estén presentes
  if (!data.dataOrder.chatId || !data.dataOrder.productsIds || !data.dataOrder.productsQuantity) {
    return NextResponse.json({
      status: "error",
      message: "Datos incompletos para procesar la solicitud.",
    });
  }
  // Construir enlaces a los productos
  const products = data.dataOrder.productsIds
    .split(",") // Convertir la cadena en un array
    .map((id) => `   ✅ <a href="https://www.cejblan-cms.vercel.app/products/${id}">${id}</a>`)
    .join("\n");
  // Construir cantidades
  const quantity = data.dataOrder.productsQuantity
    .split(",") // Convertir la cadena en un array
    .map((id) => `   ✅ ${id}`)
    .join("\n");
  const chatId = data.dataOrder.chatId;
  // Armar el mensaje
  const message = `<b>Tu pedido es el: #${data.dataOrder.id}</b>
  
Detalles del pedido:
📛 Nombre: ${data.dataOrder.name}
📧 Correo: ${data.dataOrder.email}
📱 Teléfono: ${data.dataOrder.phoneNumber}

🔎 Productos:
${products}
 #️⃣ Cantidad:
${quantity}
  
💰 Total: ${data.dataOrder.totalPrice}$
💳 Pago: ${data.dataOrder.paymentMethod}
📦 Entrega: ${data.dataOrder.deliveryMethod}
📍 Dirección: ${data.dataOrder.deliveryMethod === "Delivery" ? data.dataOrder.address : data.dataOrder.deliveryMethodData}

📆 Fecha: ${date}
⏳ Estado: ${data.dataOrder.status}
`;
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