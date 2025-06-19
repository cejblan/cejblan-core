import { conexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const customerEmail = searchParams.get("customerEmail");

  if (!customerEmail) {
    return NextResponse.json({ error: "No se proporcionó el email del cliente" }, { status: 400 });
  }

  try {
    const [profileItems] = await conexion.query(
      "SELECT * FROM users WHERE email = ?",
      [customerEmail]
    );

    if (profileItems.length === 0) {
      return NextResponse.json(false, { status: 200 }); // Si el usuario no esta registrado, devuelve false
    }

    return NextResponse.json(profileItems, { status: 200 });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json(); // Recibir JSON
    // Filtrar solo las claves y valores válidos
    const keys = Object.keys(data).filter((key) => data[key] !== undefined && data[key] !== null);
    // Construir dinámicamente las partes del query
    const fields = keys.filter((key) => key !== "email").map((key) => `${key} = ?`).join(", ");
    const values = keys.filter((key) => key !== "email").map((key) => data[key]);

    if (!fields) {
      return new Response("No hay datos para actualizar", { status: 400 });
    }

    values.push(data.email);
    const query = `UPDATE users SET ${fields} WHERE email = ?`;

    await conexion.query(query, values);
    // Iniciar cuenta regresiva para establecer el código en null después de 1 minuto
    const { code, email } = data;

    if (code) {
      setTimeout(async () => {
        try {
          const [updateResult] = await conexion.query(
            "UPDATE users SET code = NULL WHERE email = ? AND code = ?",
            [email, code]
          );
          if (updateResult.affectedRows > 0) {
            console.log(`Código ${code} eliminado para ${email}`);
          } else {
            console.log(`El código ${code} ya no existía para ${email}`);
          }
        } catch (err) {
          console.error(`Error eliminando código para ${email}:`, err.message);
        }
      }, 60 * 1000);
    }

    return NextResponse.json({ updatedData: data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}