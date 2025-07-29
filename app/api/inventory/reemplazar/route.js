import { conexion } from '@/libs/mysql';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { productos } = await req.json(); // array con productos corregidos

    const actualizados = [];

    for (const prod of productos) {
      const { id, name, quantity, price, wholesale_price } = prod;

      const [result] = await conexion.query(
        'UPDATE products SET name = ?, quantity = ?, price = ?, wholesale_price = ? WHERE id = ?',
        [name, quantity, price, wholesale_price, id]
      );

      if (result.affectedRows > 0) {
        actualizados.push(prod);
      }
    }

    return NextResponse.json({ ok: true, actualizados });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
