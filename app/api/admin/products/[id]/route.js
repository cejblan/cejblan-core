import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function GET(req, { params }) {
  try {
    const result = await conexion.query("SELECT * FROM products WHERE id = ?", [
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
  } finally {
    await conexion.end();
  }
}

export async function DELETE(request, { params }) {
  try {
    // Obtén el producto de la base de datos para verificar si tiene imagen
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
    const imageUrl = product.image;
    // Si el producto tiene una imagen, intenta eliminarla de Cloudinary
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      // Llama a Cloudinary para eliminar la imagen
      await cloudinary.uploader.destroy(publicId);
    }
    // Elimina el producto de la base de datos
    const result = await conexion.query("DELETE FROM products WHERE id = ?", [
      params.id,
    ]);

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
  } finally {
    await conexion.end();
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

    if (!data.get("name")) {
      return NextResponse.json(
        {
          message: "Name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (image) {
      const buffer = await processImage(image);
      const res = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
            },
            async (err, result) => {
              if (err) {
                console.log(err);
                reject(err);
              }

              resolve(result);
            }
          )
          .end(buffer);
      });

      updateData.image = res.secure_url;
    }

    const result = await conexion.query("UPDATE products SET ? WHERE id = ?", [
      updateData,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Producto no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    const updatedProduct = await conexion.query(
      "SELECT * FROM products WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(updatedProduct);

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
