import { NextResponse } from 'next/server';
import { conexion } from '@/libs/mysql';

export async function GET() {
  try {
    const [rows] = await conexion.query('SELECT file FROM cms ORDER BY updated_at DESC');
    const files = rows.map(row => row.file);
    return NextResponse.json({ files });
  } catch (err) {
    console.error('Error en /api/cms/list:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
