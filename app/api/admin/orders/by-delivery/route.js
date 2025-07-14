import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Falta id" }, { status: 400 });
    }

    const [userResult] = await conexion.query("SELECT * FROM users WHERE id = ?", [id]);
    if (userResult.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const user = userResult[0];

    let query = `
      SELECT o.*, u.name AS deliveryName
      FROM orders o
      LEFT JOIN users u ON o.Delivery = u.id
    `;
    const params = [];

    if (user.role === "Delivery") {
      query += " WHERE o.Delivery = ?";
      params.push(id);
    }

    query += " ORDER BY o.DeliveryDate ASC";

    const [orders] = await conexion.query(query, params);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
