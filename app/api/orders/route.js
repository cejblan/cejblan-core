import { NextResponse } from "next/server";
import { conexion2 } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function GET(request, res) {
  const { searchParams } = new URL(request.url);
  const customerEmail = searchParams.get("customerEmail");
  try {
    const results = await conexion2.query("SELECT * FROM orders WHERE email = ?",
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
    await conexion2.end();
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const image = data.get("image");

    if (!image) {
      const result = await conexion2.query("INSERT INTO orders SET ?", {
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
      const result = await conexion2.query("INSERT INTO orders SET ?", {
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
        image: res.secure_url,
        status: "PROCESANDO",
        chatId: data.get("chatId"),
      });

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
        image: res.secure_url,
        status: "PROCESANDO",
        chatId: data.get("chatId"),
      });
    }
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
    await conexion2.end();
  }
}