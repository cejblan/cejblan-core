import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '36');

  try {
    const { blobs } = await list();

    const imagenes = blobs
      .filter(blob =>
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(blob.pathname)
      )
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));


    const total = imagenes.length;
    const totalPaginas = Math.ceil(total / limit);
    const inicio = (page - 1) * limit;
    const paginaActual = imagenes.slice(inicio, inicio + limit);

    return NextResponse.json({
      imagenes: paginaActual.map(img => ({
        url: img.url,
        pathname: img.pathname,
        uploadedAt: img.uploadedAt
      })),
      totalPaginas
    });
  } catch (err) {
    console.error('Error al listar imágenes:', err);
    return NextResponse.json({ error: 'Error al listar imágenes' }, { status: 500 });
  }
}
