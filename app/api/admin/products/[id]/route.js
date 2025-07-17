import { NextResponse } from 'next/server';
import { conexion } from '@/libs/mysql';
import { del } from '@vercel/blob';

export async function GET(req, { params: { id } }) {
  try {
    const [result] = await conexion.query("SELECT * FROM products WHERE id = ?", [id]);

    if (result.length === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params: { id } }) {
  try {
    const [product] = await conexion.query("SELECT image FROM products WHERE id = ?", [id]);

    if (!product || product.length === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    const imageUrl = product[0].image;
    if (imageUrl && imageUrl.includes('vercel-storage.com')) {
      const filePath = imageUrl.split('/').slice(3).join('/');
      try {
        await del(filePath);
      } catch (err) {
        console.warn("No se pudo eliminar la imagen de Vercel Blob:", err.message);
      }
    }

    const [result] = await conexion.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params: { id } }) {
  try {
    const data = await req.formData();

    const updateData = {
      code_bill: data.get("code_bill"),
      name: data.get("name"),
      price: data.get("price"),
      wholesale_price: data.get("wholesale_price"),
      description: data.get("description"),
      category: data.get("category"),
      quantity: data.get("quantity"),
      image: data.get("imageUrl") || "", // ← imagen elegida desde galería
    };

    if (!updateData.name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const [result] = await conexion.query("UPDATE products SET ? WHERE id = ?", [updateData, id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    const [updatedProduct] = await conexion.query("SELECT * FROM products WHERE id = ?", [id]);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
