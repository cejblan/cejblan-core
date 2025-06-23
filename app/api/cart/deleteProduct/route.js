import { conexion } from "@/libs/mysql";
import { getServerSession, authOptions } from "next-auth";

export async function DELETE(req) {
  const connection = await conexion.getConnection();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ message: "No autorizado" }), {
        status: 401,
      });
    }

    const userEmail = session.user.email;
    const { productsIds } = await req.json();

    if (!Array.isArray(productsIds) || productsIds.length === 0) {
      return new Response(JSON.stringify({ message: "Datos inválidos" }), {
        status: 400,
      });
    }
    // Construcción segura de la consulta
    const placeholders = productsIds.map(() => "?").join(", ");
    const query = `DELETE FROM cart WHERE id IN (${placeholders}) AND customer = ?`;
    const queryParams = [...productsIds, userEmail];
    // Ejecución de la consulta sin destructuración
    const [result] = await connection.query(query, queryParams);
    // Validar si la eliminación tuvo éxito
    if (result && result.affectedRows > 0) {
      return new Response(
        JSON.stringify({ message: "Producto(s) eliminado(s) con éxito" }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Producto(s) no encontrado(s) o no pertenece(n) al usuario",
        }),
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return new Response(
      JSON.stringify({ message: "Error al eliminar el producto" }),
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}