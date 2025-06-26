import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { conexion } from '@/libs/mysql';

export async function GET(req, res) {
  try {
    const [results] = await conexion.query("SELECT * FROM products");
    // Devuelve la respuesta con los encabezados configurados dentro de NextResponse
    return NextResponse.json(results, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const image = data.get("image");

    // Si NO hay imagen, se guarda sin campo `image`
    if (!image || !(image instanceof Blob)) {
      const [result] = await conexion.query("INSERT INTO products SET ?", {
        name: data.get("name"),
        description: data.get("description"),
        price: data.get("price"),
        category: data.get("category"),
        quantity: data.get("quantity"),
      });

      return NextResponse.json({
        id: result.insertId,
        name: data.get("name"),
        description: data.get("description"),
        price: data.get("price"),
        category: data.get("category"),
        quantity: data.get("quantity"),
      });
    }

    // Subir imagen a Vercel Blob
    const blob = await put(image.name, image, {
      access: 'public',
    });

    // Guardar producto con URL de imagen
    const [result] = await conexion.query("INSERT INTO products SET ?", {
      name: data.get("name"),
      description: data.get("description"),
      price: data.get("price"),
      category: data.get("category"),
      quantity: data.get("quantity"),
      image: blob.url,
    });

    return NextResponse.json({
      id: result.insertId,
      name: data.get("name"),
      description: data.get("description"),
      price: data.get("price"),
      category: data.get("category"),
      quantity: data.get("quantity"),
      image: blob.url,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
