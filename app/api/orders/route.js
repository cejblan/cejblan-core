import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import { put } from "@vercel/blob";

export async function GET(request, res) {
  const { searchParams } = new URL(request.url);
  const customerEmail = searchParams.get("customerEmail");

  try {
    const [results] = await conexion.query("SELECT * FROM orders WHERE email = ?", [
      customerEmail
    ]);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const image = data.get("image");

    let imageUrl = null;

    if (image && image instanceof Blob) {
      const blob = await put(`orders/${image.name}`, image, {
        access: "public",
      });
      imageUrl = blob.url;
    }

    // 🔹 Formatear fecha de entrega si existe
    const deliveryDateRaw = data.get("deliveryDate");
    let deliveryDateFormatted = null;
    if (deliveryDateRaw) {
      deliveryDateFormatted = new Date(deliveryDateRaw).toISOString().slice(0, 19).replace("T", " ");
    }

    const [result] = await conexion.query("INSERT INTO orders SET ?", {
      productsIds: data.get("productsIds"),
      productsQuantity: data.get("productsQuantity"),
      totalPrice: data.get("totalPrice"),
      name: data.get("name"),
      email: data.get("email"),
      phoneNumber: data.get("phoneNumber"),
      paymentMethod: data.get("paymentMethod"),
      deliveryDate: deliveryDateFormatted, // ✅ Aquí va ya formateada
      deliveryMethod: data.get("deliveryMethod"),
      deliveryMethodData: data.get("deliveryMethodData"),
      address: data.get("address"),
      latitude: data.get("latitude"),
      longitude: data.get("longitude"),
      image: imageUrl,
      status: "PROCESANDO",
      chatId: data.get("chatId"),
    });

    // 🔸 Descontar stock
    const ids = data.get("productsIds").split(",").map(id => Number(id));
    const quantities = data.get("productsQuantity").split(",").map(qty => Number(qty));

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const qty = quantities[i];

      const [result2] = await conexion.query(
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

      const [result3] = await conexion.query(
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
      deliveryDate: deliveryDateFormatted,
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
