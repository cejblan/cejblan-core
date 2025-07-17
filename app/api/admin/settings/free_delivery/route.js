import { conexion } from '@/libs/mysql';

export async function GET() {
  try {
    const [rows] = await conexion.query(
      "SELECT value FROM settings WHERE name = 'free_delivery' LIMIT 1"
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ value: null }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ value: rows[0].value }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching free_delivery setting:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}