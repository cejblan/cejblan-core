import { conexion } from "@/libs/mysql";

export async function GET() {
  try {
    const [rows] = await conexion.query("SELECT MAX(id) + 1 AS nextId FROM products");
    const nextId = rows[0].nextId || 1; // si no hay productos, empieza en 1

    return Response.json({ nextId });
  } catch (error) {
    console.error("Error al obtener el próximo ID:", error);
    return new Response(JSON.stringify({ error: "Error al obtener el próximo ID" }), {
      status: 500,
    });
  }
}
