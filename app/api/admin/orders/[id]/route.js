import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req, { params }) {
  try {
    const result = await conexion.query("SELECT * FROM orders WHERE id = ?", [
      params.id,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "Forma de pago no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    // Devuelve la respuesta con los encabezados configurados dentro de NextResponse
    return NextResponse.json(result[0], {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await conexion.end();
  }
}

export async function DELETE(request, { params }) {
  try {
    // Obtén el pedido de la base de datos para obtener el enlace de la imagen
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
    const imageUrl = order.image;
    // Si el pedido tiene una imagen, intenta eliminarla de Cloudinary
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      // Llama a Cloudinary para eliminar la imagen
      await cloudinary.uploader.destroy(publicId);
    }
    // Elimina el pedido de la base de datos
    const result = await conexion.query("DELETE FROM orders WHERE id = ?", [
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
  } finally {
    await conexion.end();
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.formData();
    const updateData = {
      name: data.get("name"),
      status: data.get("status"),
    };

    const result = await conexion.query("UPDATE orders SET ? WHERE id = ?", [
      updateData,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Forma de pago no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    const updatedProduct = await conexion.query(
      "SELECT * FROM orders WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(updatedProduct[0]);

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await conexion.end();
  }
}
