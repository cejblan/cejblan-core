import { conexion } from "@/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const customerEmail = searchParams.get("customerEmail");

  if (!customerEmail) {
    return NextResponse.json({ error: "No se proporcionó el email del cliente" }, { status: 400 });
  }

  const connection = await conexion.getConnection();
  try {
    // Obtener los IDs de los productos en la wishlist del cliente
    const [wishlistItems] = await connection.query(
      "SELECT id FROM wishlist WHERE customer = ?",
      [customerEmail]
    );
    console.log(wishlistItems)

    if (wishlistItems.length === 0) {
      return NextResponse.json([], { status: 200 }); // Si la wishlist está vacía, retornamos un arreglo vacío
    }

    const productIds = wishlistItems.map(item => item.id); // Extraer los IDs
    // Obtener todos los detalles de los productos según los IDs
    const [products] = await connection.query(
      "SELECT * FROM products WHERE id IN (?)",
      [productIds]
    );
    // Retornar los productos
    console.log(products)
    return NextResponse.json(products, {
      status: 200,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function POST(request) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();

    const [result] = await connection.query("INSERT INTO wishlist SET ?", {
      id: data.get("id"),
      customer: data.get("customer"),
    });

    return NextResponse.json({
      id: data.get("id"),
      customer: data.get("customer"),
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

export async function DELETE(req) {
  const connection = await conexion.getConnection();
  try {
    const { id, customer } = await req.json(); // Obtenemos los datos enviados en formato JSON
    // Consulta para eliminar registros que coincidan con el id y el customer
    const [result] = await connection.query(
      "DELETE FROM wishlist WHERE id = ? AND customer = ?",
      [id, customer]
    );

    return NextResponse.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar registros de la wishlist:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  } finally {
    connection.release();
  }
}
