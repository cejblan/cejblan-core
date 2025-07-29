import { conexion } from '@/libs/mysql';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { productos } = await req.json(); // array de productos

    const productosRegistrados = [];
    const productosEnConflicto = [];

    for (const prod of productos) {
      const id = parseInt(prod.id); // <-- convierte el ID para ignorar ceros a la izquierda
      const { name, quantity, price, wholesale_price } = prod;

      const [existente] = await conexion.query(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      if (existente.length > 0) {
        const p = existente[0];
        const esIgual =
          p.name === name &&
          p.quantity === quantity &&
          Number(p.price) === Number(price) &&
          Number(p.wholesale_price) === Number(wholesale_price);

        if (!esIgual) {
          productosEnConflicto.push({
            original: p,
            nuevo: { ...prod, id }, // actualiza el ID convertido
          });
        }

        continue; // no se registra, ya existe
      }

      await conexion.query('INSERT INTO products SET ?', {
        id,
        name,
        quantity,
        price,
        wholesale_price,
      });

      productosRegistrados.push({ ...prod, id }); // actualiza el ID convertido
    }

    return NextResponse.json({
      ok: true,
      registrados: productosRegistrados,
      conflictos: productosEnConflicto,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
