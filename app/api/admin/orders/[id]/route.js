import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import { del } from "@vercel/blob";

export async function GET(request, context) {
  const { params } = context;

  try {
    const [result] = await conexion.query("SELECT * FROM orders WHERE id = ?", [
      params.id,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const { params } = context;

  try {
    const [order] = await conexion.query(
      "SELECT image FROM orders WHERE id = ?",
      [params.id]
    );

    if (!order || order.length === 0) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const imageUrl = order[0].image;

    // Eliminar imagen de Vercel Blob si existe
    if (imageUrl && imageUrl.includes("vercel-storage.com")) {
      const filePath = imageUrl.split("/").slice(3).join("/");
      try {
        await del(filePath); // borra la imagen del bucket
      } catch (err) {
        console.warn("No se pudo eliminar la imagen de Vercel Blob:", err.message);
      }
    }

    const [result] = await conexion.query("DELETE FROM orders WHERE id = ?", [
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  const { params } = context;

  try {
    const data = await request.formData();

    const updateData = {
      name: data.get("name"),
      status: data.get("status"),
    };

    const [result] = await conexion.query("UPDATE orders SET ? WHERE id = ?", [
      updateData,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const [updatedOrder] = await conexion.query(
      "SELECT * FROM orders WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
