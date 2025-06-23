import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

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

    if (!image) {
      const [result] = await conexion.query("INSERT INTO products SET ?", {
        name: data.get("name"),
        description: data.get("description"),
        price: data.get("price"),
        /* Se comento codigo innecesario
        iva: data.get("iva"),
        */
        category: data.get("category"),
        quantity: data.get("quantity"),
      });

      return NextResponse.json({
        id: result.insertId,
        name: data.get("name"),
        description: data.get("description"),
        price: data.get("price"),
        /* Se comento codigo innecesario
        iva: data.get("iva"),
        */
        category: data.get("category"),
        quantity: data.get("quantity"),
      });
    }
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
    const [result] = await conexion.query("INSERT INTO products SET ?", {
      name: data.get("name"),
      description: data.get("description"),
      price: data.get("price"),
      /* Se comento codigo innecesario
      iva: data.get("iva"),
      */
      category: data.get("category"),
      quantity: data.get("quantity"),
      image: res.secure_url,
    });

    return NextResponse.json({
      id: result.insertId,
      name: data.get("name"),
      description: data.get("description"),
      price: data.get("price"),
      /* Se comento codigo innecesario
      iva: data.get("iva"),
      */
      category: data.get("category"),
      quantity: data.get("quantity"),
      image: res.secure_url,
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