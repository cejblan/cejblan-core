import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request) {
  const data = await request.json();
  const moment = require("moment");
  const date = moment(data.dataOrder.date).subtract(4, "hours").format("DD/MM/YYYY")
  if (!data.dataOrder.chatId || !data.dataOrder.productsIds || !data.dataOrder.productsQuantity) {
    return NextResponse.json({
      status: "error",
      message: "Datos incompletos para procesar la solicitud.",
    });
  }
  const products = data.dataOrder.productsIds
  .split(",") // Convertir la cadena en un array
  .map((id) => `   ✅ <a href="https://www.cejblan.com/adriliciaus/products/${id}">${id}</a>`)
  .join("\n");
  const quantity = data.dataOrder.productsQuantity
  .split(",") // Convertir la cadena en un array
  .map((id) => `   ✅ ${id}`)
  .join("\n");
  const chatId = data.dataOrder.chatId;
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
  return NextResponse.json({
    status: "success",
    message: "Mensaje enviado a Telegram correctamente.",
  });
}