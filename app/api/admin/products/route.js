import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function GET(req, res) {
  const connection = await conexion.getConnection();
  try {
    const [results] = await connection.query("SELECT * FROM products");
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function POST(request) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();
    const image = data.get("image");

    let imageUrl = null;

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

      imageUrl = res.secure_url;
    }

    const [result] = await connection.query("INSERT INTO products SET ?", {
      name: data.get("name"),
      description: data.get("description"),
      price: data.get("price"),
      category: data.get("category"),
      quantity: data.get("quantity"),
      image: imageUrl,
    });

    return NextResponse.json({
      id: result.insertId,
      name: data.get("name"),
      description: data.get("description"),
      price: data.get("price"),
      category: data.get("category"),
      quantity: data.get("quantity"),
      image: imageUrl,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}