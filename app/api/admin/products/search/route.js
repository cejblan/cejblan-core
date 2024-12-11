export const dynamic = "force-dynamic";

import { conexion } from "@/libs/mysql";

export async function GET(request) {
  try {
    // Acceder directamente a los parámetros de búsqueda
    const query = request.nextUrl.searchParams.get('q') || '';
    if (!query.trim()) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    const products = await conexion.query(
      'SELECT name FROM products WHERE name LIKE ? ORDER BY name ASC LIMIT 10',
      [`%${query}%`]
    );
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return new Response(
      JSON.stringify({ error: 'Hubo un problema al procesar la solicitud.' }),
      { status: 500 }
    );
  } finally {
    await conexion.end();
  }
}