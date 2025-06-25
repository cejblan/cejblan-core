import { NextResponse } from 'next/server';
import { conexion } from '@/libs/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se especificó archivo' }, { status: 400 });
    }

    const [rows] = await conexion.query('SELECT content FROM cms WHERE file = ?', [file]);

    if (rows.length === 0) {
      return NextResponse.json({ content: '' }); // Archivo vacío o no existe aún
    }

    return NextResponse.json({ content: rows[0].content });
  } catch (err) {
    console.error('Error en /api/cms/read:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}