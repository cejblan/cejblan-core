import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import { del } from '@vercel/blob';

// Obtener un usuario por ID
export async function GET(req, { params: { id } }) {
  try {
    const [result] = await conexion.query("SELECT * FROM users WHERE id = ?", [id]);

    if (result.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Crear un nuevo usuario
export async function POST(request) {
  try {
    const data = await request.formData();

    const name = data.get("name");
    const email = data.get("email");
    const rol = data.get("rol");
    const image = data.get("image");

    const [result] = await conexion.query("INSERT INTO users SET ?", {
      name,
      email,
      rol,
      image,
    });

    return NextResponse.json({ id: result.insertId, name, email, rol, image });
  } catch (error) {
    console.error("POST user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Actualizar un usuario existente
export async function PUT(request, { params: { id } }) {
  try {
    const data = await request.formData();

    const updateData = {
      name: data.get("name"),
      email: data.get("email"),
      rol: data.get("rol"),
      image: data.get("image"),
    };

    const [result] = await conexion.query("UPDATE users SET ? WHERE id = ?", [
      updateData,
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const [updatedUser] = await conexion.query("SELECT * FROM users WHERE id = ?", [id]);

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Eliminar un usuario
export async function DELETE(request, { params: { id } }) {
  try {
    const [user] = await conexion.query("SELECT image FROM users WHERE id = ?", [id]);

    if (!user || user.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const imageUrl = user[0].image;

    if (imageUrl && imageUrl.includes("vercel-storage.com")) {
      const filePath = imageUrl.split("/").slice(3).join("/");
      try {
        await del(filePath);
      } catch (err) {
        console.warn("No se pudo eliminar la imagen de Vercel Blob:", err.message);
      }
    }

    const [result] = await conexion.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}