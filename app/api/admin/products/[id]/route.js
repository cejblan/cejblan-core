import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function GET(req, { params }) {
  const connection = await conexion.getConnection();
  try {
    const [result] = await connection.query("SELECT * FROM products WHERE id = ?", [
      params.id,
    ]);

    if (result.length === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
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
    const [product] = await connection.query(
      "SELECT image FROM products WHERE id = ?",
      [params.id]
    );

    if (!product || product.length === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    const imageUrl = product[0].image;

    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const [result] = await connection.query("DELETE FROM products WHERE id = ?", [
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
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
    const image = data.get("image");

    const updateData = {
      name: data.get("name"),
      price: data.get("price"),
      description: data.get("description"),
      category: data.get("category"),
      quantity: data.get("quantity"),
    };

    if (!data.get("name")) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    if (image) {
      const buffer = await processImage(image);
      const res = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (err, result) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      updateData.image = res.secure_url;
    }

    const [result] = await connection.query("UPDATE products SET ? WHERE id = ?", [
      updateData,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    const [updatedProduct] = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}