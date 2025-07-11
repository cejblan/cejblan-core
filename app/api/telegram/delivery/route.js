"use server";

import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { conexion } from "@/libs/mysql";

export async function POST(request) {
  const data = await request.json();

  if (!data.chatId || !data.orderId || !data.deliveryInfo || !data.totalPrice || !data.paymentMethod) {
    return NextResponse.json({
      status: "error",
      message: "Faltan datos necesarios para enviar el mensaje."
    });
  }

  const chatId = data.chatId;
  const token = process.env.BOT_TOKEN;

  if (!token) {
    console.error("BOT_TOKEN no está configurado.");
    return NextResponse.json({
      status: "error",
      message: "Error del servidor. BOT_TOKEN no está configurado."
    });
  }

  const message = `<b>Tienes un nuevo pedido para entregar</b>\n\n🧾 <b>ID del Pedido:</b> <code>${data.orderId}</code>\n💰 <b>Monto:</b> ${data.totalPrice}$\n📦 <b>Método de Entrega:</b> ${data.deliveryInfo.deliveryMethod}\n📍 <b>Dirección:</b> ${data.deliveryInfo.address || data.deliveryInfo.deliveryMethodData}\n💳 <b>Método de Pago:</b> ${data.paymentMethod}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML"
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    console.error("Error al enviar el mensaje:", response.statusText);
    return NextResponse.json({
      status: "error",
      message: "No se pudo enviar el mensaje a Telegram."
    });
  }

  try {
    await conexion.query(
      `INSERT INTO telegram_messages (chat_id, text, from_bot) VALUES (?, ?, ?)`,
      [chatId, message, 1]
    );
  } catch (error) {
    console.error("Error al guardar el mensaje en telegram_messages:", error);
    return NextResponse.json({
      status: "error",
      message: "Mensaje enviado, pero no se pudo guardar en la base de datos."
    });
  }

  return NextResponse.json({
    status: "success",
    message: "Mensaje enviado a Telegram y guardado correctamente."
  });
}
