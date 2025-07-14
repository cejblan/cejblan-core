import { NextResponse } from "next/server";

export async function POST(request) {
  const { chatId, orderId, deliveryInfo, name, phoneNumber, deliveryDate } = await request.json();
  const token = process.env.BOT_TOKEN;

  if (!chatId || !orderId) {
    return NextResponse.json({ status: "error", message: "Datos incompletos." });
  }

  // Formatear fecha y hora (suponiendo que deliveryDate viene en ISO o similar)
  const moment = require("moment");
  const formattedDate = deliveryDate
    ? moment(deliveryDate).format("dddd, D [de] MMMM [a las] h:mm A")
    : "No especificada";

  const message = `<b>📦 Nuevo pedido asignado</b>

👤 Cliente: ${name}
📞 Teléfono: ${phoneNumber}
📍 Dirección: ${deliveryInfo.deliveryMethod === "Delivery" ? deliveryInfo.address : deliveryInfo.deliveryMethodData}
📅 Fecha y hora: ${formattedDate}
`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error enviando Telegram:", text);
      return NextResponse.json({ status: "error", message: "No se pudo enviar mensaje a delivery." });
    }

    return NextResponse.json({ status: "success", message: "Mensaje enviado al delivery." });
  } catch (error) {
    console.error("Error en API Telegram:", error);
    return NextResponse.json({ status: "error", message: "Error en el servidor." });
  }
}
