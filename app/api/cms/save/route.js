import { NextResponse } from 'next/server';
import { conexion } from '@/libs/mysql';

export async function POST(request) {
  try {
    const { file, content } = await request.json();

    if (!file) {
      return NextResponse.json({ error: 'No se especificó archivo' }, { status: 400 });
    }

    // Usamos INSERT ... ON DUPLICATE KEY UPDATE para crear o actualizar
    await conexion.query(
      `INSERT INTO cms (file, content, updated_at) VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW()`,
      [file, content]
    );

    return NextResponse.json({ message: 'Archivo guardado correctamente' });
  } catch (err) {
    console.error('Error en /api/cms/save:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}