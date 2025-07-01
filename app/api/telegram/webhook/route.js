import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function POST(request) {
  const update = await request.json();

  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    // Limpiar y convertir a minúsculas
    const messageText = update.message.text.trim().toLowerCase();
    const userName = update.message.from?.first_name || "Usuario";
    const userLastName = update.message.from?.last_name || "";
    const fullName = `${userName} ${userLastName}`.trim();
    const verifiedTrue = 1;
    let responseMessage;

    // 1️⃣ Guardar mensaje recibido
    try {
      await conexion.query(
        "INSERT INTO telegram_messages (chat_id, text, from_bot) VALUES (?, ?, ?)",
        [chatId, messageText, 0]
      );
    } catch (err) {
      console.error("Error guardando mensaje entrante:", err);
    }

    // 2️⃣ Determinar respuesta automática
    const responses = {
      start: () => `¡Hola, ${userName}! Has comenzado un chat con el bot de CejblanCMS. Para recibir notificaciones sobre tus pedidos, debes enviar por aquí el código de 6 dígitos.\n\nSi no sabes a qué código nos referimos, puedes ingresar a www.cejblan-cms.vercel.app, registrarte e ir a tu perfil.`,
      hola: () => `¡Hola, ${userName}! ¿Cómo puedo ayudarte hoy?`,
      ayuda: () => `Claro, ${userName}, dime qué necesitas y trataré de asistirte`,
      adiós: () => `¡Hasta luego, ${userName}! Espero verte pronto 🤗`,
      bye: () => `¡Hasta luego, ${userName}! Espero verte pronto 🤗`,
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
        if (data[0]) {
          if (data[0].verified === verifiedTrue && data[0].chatId !== chatId) {
            await conexion.query("UPDATE users SET chatId = ? WHERE code = ?", [chatId, code]);
            responseMessage = `<b>Hola, ${userName}</b>. Tu chat ha sido actualizado correctamente 😉`;
          } else if (!data[0].verified && !data[0].chatId && data[0].code == code) {
            await conexion.query(
              "UPDATE users SET verified = ?, chatId = ? WHERE code = ?",
              [verifiedTrue, chatId, code]
            );
            responseMessage = `<b>Hola, ${userName}</b>. Tu cuenta ha sido enlazada correctamente con el bot. Ahora podré entregarte los datos de tus pedidos por aquí 😏. Recuerda completar los datos del perfil para que puedas comprar en nuestra tienda 🥰`;
          } else {
            responseMessage = `<b>Hola, ${userName}</b>. El código ingresado ya está vinculado o no es válido.`;
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

    // 3️⃣ Enviar mensaje al usuario
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

      // 4️⃣ Guardar mensaje enviado
      await conexion.query(
        "INSERT INTO telegram_messages (chat_id, text, from_bot) VALUES (?, ?, ?)",
        [chatId, responseMessage, 1]
      );

    } catch (err) {
      console.error("Error en la solicitud a Telegram:", err);
      return NextResponse.json({
        status: "error",
        message: "No se pudo realizar la solicitud a Telegram.",
      });
    }

    return NextResponse.json({ status: "ok", message: responseMessage });
  }

  return NextResponse.json({ status: "error", message: "No message received" });
}
