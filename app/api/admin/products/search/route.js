export const dynamic = "force-dynamic";

import { conexion } from "@/libs/mysql";

export async function GET(request) {
  const connection = await conexion.getConnection();

  try {
    const query = request.nextUrl.searchParams.get("q") || "";
    if (!query.trim()) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const [products] = await connection.query(
      "SELECT name, price, quantity FROM products WHERE name LIKE ? ORDER BY name ASC LIMIT 10",
      [`%${query}%`]
    );

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    return new Response(
      JSON.stringify({ error: "Hubo un problema al procesar la solicitud." }),
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}