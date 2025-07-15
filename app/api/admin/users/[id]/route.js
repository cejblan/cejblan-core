import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import { put, del } from "@vercel/blob";

export async function GET(req, { params: { id } }) {
  try {
    const [result] = await conexion.query("SELECT * FROM users WHERE id = ?", [id]);

    if (result.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const image = data.get("image");

    const name = data.get("name");
    const email = data.get("email");
    const rol = data.get("rol");

    let imageUrl = null;

    if (image && image instanceof Blob) {
      const blob = await put(image.name, image, {
        access: "public",
      });
      imageUrl = blob.url;
    }

    const [result] = await conexion.query("INSERT INTO users SET ?", {
      name,
      email,
      rol,
      image: imageUrl,
    });

    return NextResponse.json({
      name,
      email,
      rol,
      image: imageUrl,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params: { id } }) {
  try {
    const data = await request.formData();
    const image = data.get("image");

    const updateData = {
      name: data.get("name"),
      email: data.get("email"),
      rol: data.get("rol"),
    };

    if (image && image instanceof Blob) {
      const blob = await put(image.name, image, {
        access: "public",
      });
      updateData.image = blob.url;
    }

    const [result] = await conexion.query("UPDATE users SET ? WHERE id = ?", [
      updateData,
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const [updatedUser] = await conexion.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

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
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}