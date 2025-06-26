import { NextResponse } from 'next/server';
import { conexion } from '@/libs/mysql';
import { put } from '@vercel/blob';

export async function GET(req, { params }) {
  try {
    const [result] = await conexion.query("SELECT * FROM products WHERE id = ?", [
      params.id,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "Producto no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(result, {
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
  }
}

export async function DELETE(request, { params }) {
  try {
    // Buscar la imagen del producto
    const [product] = await conexion.query(
      "SELECT image FROM products WHERE id = ?",
      [params.id]
    );

    if (!product || product.length === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const imageUrl = product[0].image;

    // Eliminar imagen de Vercel Blob si existe
    if (imageUrl && imageUrl.includes('vercel-storage.com')) {
      const filePath = imageUrl.split('/').slice(3).join('/');
      try {
        await del(filePath); // borra la imagen del bucket
      } catch (err) {
        console.warn("No se pudo eliminar la imagen de Vercel Blob:", err.message);
      }
    }

    // Eliminar el producto de la base de datos
    const [result] = await conexion.query(
      "DELETE FROM products WHERE id = ?",
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
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

export async function PUT(request, { params }) {
  try {
    const data = await request.formData();
    const image = data.get("image");

    const updateData = {
      name: data.get("name"),
      price: data.get("price"),
      description: data.get("description"),
      category: data.get("category"),
      quantity: data.get("quantity"),
    };

    if (!updateData.name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    if (image && image instanceof Blob) {
      const blob = await put(image.name, image, {
        access: "public",
      });
      updateData.image = blob.url;
    }

    const [result] = await conexion.query(
      "UPDATE products SET ? WHERE id = ?",
      [updateData, params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const [updatedProduct] = await conexion.query(
      "SELECT * FROM products WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
