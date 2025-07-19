import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { conexion } from "@/libs/mysql";

export async function POST(request) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const data = await request.json();
  const moment = require("moment");

  const date = moment(data.dataOrder.date).subtract(4, "hours").format("DD/MM/YYYY");

  if (!data.dataOrder.chatId || !data.dataOrder.productsIds || !data.dataOrder.productsQuantity) {
    return NextResponse.json({
      status: "error",
      message: "Datos incompletos para procesar la solicitud.",
    });
  }

  const products = data.dataOrder.productsIds
    .split(",")
    .map((id) => `   ✅ <a href="${siteUrl}/products/${id}">${id}</a>`)
    .join("\n");

  const quantity = data.dataOrder.productsQuantity
    .split(",")
    .map((q) => `   ✅ ${q}`)
    .join("\n");

  const chatId = data.dataOrder.chatId;
  const token = process.env.BOT_TOKEN;

  if (!token) {
    console.error("BOT_TOKEN no está configurado.");
    return NextResponse.json({
      status: "error",
      message: "Error del servidor. BOT_TOKEN no está configurado.",
    });
  }

  // Mensaje para el cliente
  const messageClient = `<b>Tu pedido es el: #${data.dataOrder.id}</b>
  
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
${data.dataOrder.deliveryMethod?.includes("Delivery")
      ? `💱 Costo: ${data.dataOrder.deliveryMethodData}${data.dataOrder.deliveryMethodData !== "Gratis" ? "$" : ""}\n📍 Dirección: ${data.dataOrder.address}`
      : `📍 Dirección: ${data.dataOrder.deliveryMethodData}`}

📆 Fecha: ${date}
⏳ Estado: ${data.dataOrder.status}
`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  // Enviar al cliente
  const responseCliente = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: messageClient,
      parse_mode: "HTML",
    }),
  });

  if (!responseCliente.ok) {
    console.error("Error al enviar el mensaje al cliente:", responseCliente.statusText);
    return NextResponse.json({
      status: "error",
      message: "No se pudo enviar el mensaje al cliente por Telegram.",
    });
  }

  try {
    await conexion.query(
      `INSERT INTO telegram_messages (chat_id, text, from_bot) VALUES (?, ?, ?)`,
      [chatId, messageClient, 1]
    );
  } catch (error) {
    console.error("Error al guardar mensaje del cliente:", error);
  }

  // Buscar vendedores con chatId
  let vendedores = [];
  try {
    const [rows] = await conexion.query(
      "SELECT chatId FROM users WHERE rol = 'Vendedor' AND chatId IS NOT NULL"
    );
    vendedores = rows.map((v) => v.chatId);
  } catch (error) {
    console.error("Error al obtener vendedores:", error);
  }

  // Mensaje para vendedores
  const messageVendedor = `<b>🛒 Nuevo pedido registrado: #${data.dataOrder.id}</b>

📛 Cliente: ${data.dataOrder.name}
📧 Correo: ${data.dataOrder.email}
📱 Teléfono: ${data.dataOrder.phoneNumber}

🔎 Productos:
${products}
 #️⃣ Cantidad:
${quantity}
  
💰 Total: ${data.dataOrder.totalPrice}$
💳 Pago: ${data.dataOrder.paymentMethod}
📦 Entrega: ${data.dataOrder.deliveryMethod}
${data.dataOrder.deliveryMethod?.includes("Delivery")
      ? `💱 Costo: ${data.dataOrder.deliveryMethodData}${data.dataOrder.deliveryMethodData !== "Gratis" ? "$" : ""}\n📍 Dirección: ${data.dataOrder.address}`
      : `📍 Dirección: ${data.dataOrder.deliveryMethodData}`}

📆 Fecha: ${date}
⏳ Estado: ${data.dataOrder.status}
`;

  for (const vendedorChatId of vendedores) {
    try {
      const responseVendedor = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: vendedorChatId,
          text: messageVendedor,
          parse_mode: "HTML",
        }),
      });

      if (responseVendedor.ok) {
        await conexion.query(
          `INSERT INTO telegram_messages (chat_id, text, from_bot) VALUES (?, ?, ?)`,
          [vendedorChatId, messageVendedor, 1]
        );
      } else {
        console.error(`No se pudo notificar a vendedor con chatId ${vendedorChatId}`);
      }
    } catch (err) {
      console.error(`Error enviando a vendedor ${vendedorChatId}:`, err.message);
    }
  }

  return NextResponse.json({
    status: "success",
    message: "Mensajes enviados correctamente a cliente y vendedores.",
  });
}