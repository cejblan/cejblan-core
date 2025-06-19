import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function POST(request) {
  const update = await request.json(); // Datos recibidos de Telegram

  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const messageText = update.message.text.trim().toLowerCase(); // Limpiar y convertir a minúsculas
    const userName = update.message.from?.first_name || "Usuario";
    const userLastName = update.message.from?.last_name || "";
    const fullName = `${userName} ${userLastName}`.trim(); // Nombre completo del usuario
    const verifiedTrue = 1;
    let responseMessage;
    // Respuestas personalizadas
    const responses = {
      hola: () => `¡Hola, ${userName}! ¿Cómo puedo ayudarte hoy?`,
      ayuda: () => `Claro, ${userName}, dime qué necesitas y trataré de asistirte.`,
      adiós: () => `¡Hasta luego, ${userName}! Espero verte pronto.`,
      bye: () => `¡Hasta luego, ${userName}! Espero verte pronto.`,
    };
    const defaultResponse = () =>
      `Lo siento, ${userName}, no entendí tu mensaje. ¿Podrías reformularlo?`;
    // Verificar si el mensaje contiene una secuencia de 6 dígitos
    const codeRegex = /^\d{6}$/;

    try {
      if (codeRegex.test(messageText)) {
        // Código de verificación recibido
        const code = messageText;

        const [data] = await conexion.query(
          "SELECT verified, chatId, code FROM users WHERE code = ?",
          code
        );
        if (data) {
          if (data.verified === verifiedTrue && data.chatId !== chatId) {
            await conexion.query("UPDATE users SET chatId = ? WHERE code = ?", [
              chatId,
              code,
            ]);
            responseMessage = `<b>Hola, ${userName}</b>. Tu chat ha sido actualizado correctamente 😉`;
          } else if (!data.verified && !data.chatId && data.code === code) {
            await conexion.query("UPDATE users SET verified = ?, chatId = ? WHERE code = ?", [
              verifiedTrue,
              chatId,
              code,
            ]);
            responseMessage = `<b>Hola, ${data}</b>. Tu cuenta ha sido enlazada correctamente con el bot. Ahora podre entregarte los datos de tus pedidos por aqui 😏. Recuerda completar los datos del perfil para que puedas comprar en nuestra tienda 🥰`;
          }
        } else {
          responseMessage = `<b>Hola, ${userName}</b>. El código ingresado no es válido o no coincide con tu cuenta 🤷🏻‍♂️`;
        }
      } else {
        responseMessage =
          Object.keys(responses).find((key) => messageText.includes(key))
            ? responses[Object.keys(responses).find((key) => messageText.includes(key))]()
            : defaultResponse();
      }
    } catch (error) {
      console.error("Error al procesar el mensaje:", error);
      return NextResponse.json({
        status: "error",
        message: "Ha ocurrido un error interno. Inténtalo de nuevo más tarde.",
      });
    }
    // Enviar mensaje a Telegram
    const token = process.env.BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body = {
      chat_id: chatId,
      text: responseMessage,
      parse_mode: "HTML",
    };

    try {
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
    } catch (err) {
      console.error("Error en la solicitud a Telegram:", err);
      return NextResponse.json({
        status: "error",
        message: "No se pudo realizar la solicitud a Telegram.",
      });
    }

    return NextResponse.json({ status: "ok", message: responseMessage });
  }
  // Si no hay mensaje, retornamos un estado de error
  return NextResponse.json({ status: "error", message: "No message received" });
}