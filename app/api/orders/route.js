import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function GET(request, res) {
  const { searchParams } = new URL(request.url);
  const customerEmail = searchParams.get("customerEmail");
  const connection = await conexion.getConnection();
  try {
    const [results] = await connection.query("SELECT * FROM orders WHERE email = ?",
      [customerEmail]
    );
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
  } finally {
    connection.release();
  }
}

export async function POST(request) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();
    const image = data.get("image");

    let result;
    let imageUrl = null;

    if (!image) {
      [result] = await connection.query("INSERT INTO orders SET ?", {
        productsIds: data.get("productsIds"),
        productsQuantity: data.get("productsQuantity"),
        totalPrice: data.get("totalPrice"),
        name: data.get("name"),
        email: data.get("email"),
        phoneNumber: data.get("phoneNumber"),
        paymentMethod: data.get("paymentMethod"),
        deliveryMethod: data.get("deliveryMethod"),
        deliveryMethodData: data.get("deliveryMethodData"),
        address: data.get("address"),
        latitude: data.get("latitude"),
        longitude: data.get("longitude"),
        status: "PROCESANDO",
        chatId: data.get("chatId"),
      });
    } else {
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

      imageUrl = res.secure_url;

      [result] = await connection.query("INSERT INTO orders SET ?", {
        productsIds: data.get("productsIds"),
        productsQuantity: data.get("productsQuantity"),
        totalPrice: data.get("totalPrice"),
        name: data.get("name"),
        email: data.get("email"),
        phoneNumber: data.get("phoneNumber"),
        paymentMethod: data.get("paymentMethod"),
        deliveryMethod: data.get("deliveryMethod"),
        deliveryMethodData: data.get("deliveryMethodData"),
        address: data.get("address"),
        latitude: data.get("latitude"),
        longitude: data.get("longitude"),
        image: imageUrl,
        status: "PROCESANDO",
        chatId: data.get("chatId"),
      });
    }

    // --- Descuento de stock por cada producto ---
    const ids = data.get("productsIds").split(",").map(id => Number(id));
    const quantities = data.get("productsQuantity").split(",").map(qty => Number(qty));

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const qty = quantities[i];

      const [result2] = await connection.query(
        "SELECT quantity FROM products WHERE id = ?",
        [id]
      );

      const productQuantity = result2[0]?.quantity;

      if (productQuantity === undefined) {
        return NextResponse.json(
          { message: `Producto con id ${id} no encontrado en la tabla 'products'` },
          { status: 404 }
        );
      }

      const newQuantity = productQuantity - Number(qty);

      if (isNaN(newQuantity)) {
        return NextResponse.json(
          { message: `Cantidad inválida para producto con id ${id}` },
          { status: 400 }
        );
      }

      const [result3] = await connection.query(
        "UPDATE products SET quantity = ? WHERE id = ?",
        [newQuantity, id]
      );

      if (result3.affectedRows === 0) {
        return NextResponse.json(
          { message: `No se pudo actualizar el producto con id ${id}` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      id: result.insertId,
      productsIds: data.get("productsIds"),
      productsQuantity: data.get("productsQuantity"),
      totalPrice: data.get("totalPrice"),
      name: data.get("name"),
      email: data.get("email"),
      phoneNumber: data.get("phoneNumber"),
      paymentMethod: data.get("paymentMethod"),
      deliveryMethod: data.get("deliveryMethod"),
      deliveryMethodData: data.get("deliveryMethodData"),
      address: data.get("address"),
      latitude: data.get("latitude"),
      longitude: data.get("longitude"),
      image: imageUrl,
      status: "PROCESANDO",
      chatId: data.get("chatId"),
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
  } finally {
    connection.release();
  }
}