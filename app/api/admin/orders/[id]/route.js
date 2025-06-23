import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";

export async function GET(req, { params }) {
  const connection = await conexion.getConnection();
  try {
    const [result] = await connection.query("SELECT * FROM orders WHERE id = ?", [
      params.id,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Forma de pago no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function DELETE(request, { params }) {
  const connection = await conexion.getConnection();
  try {
    const [order] = await connection.query(
      "SELECT image FROM orders WHERE id = ?",
      [params.id]
    );

    if (!order || order.length === 0) {
      return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
    }

    const imageUrl = order[0].image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const [result] = await connection.query("DELETE FROM orders WHERE id = ?", [
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function PUT(request, { params }) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();
    const updateData = {
      name: data.get("name"),
      status: data.get("status"),
    };

    const [result] = await connection.query("UPDATE orders SET ? WHERE id = ?", [
      updateData,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Forma de pago no encontrada" },
        { status: 404 }
      );
    }

    const [updatedProduct] = await connection.query(
      "SELECT * FROM orders WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}