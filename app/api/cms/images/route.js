/*
import { NextResponse } from "next/server";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function POST(request) {
  try {
    const data = await request.formData();
    const image = data.get("image");
    if (!image) return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 });

    const buffer = await processImage(image);
    const res = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ secure_url: res.secure_url });
  } catch (err) {
    console.error("Error al subir imagen:", err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
*/

import { list, put, del } from '@vercel/blob';
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

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('image');

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Archivo no válido' }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return NextResponse.json({ secure_url: blob.url });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname');
  if (!pathname) {
    return NextResponse.json({ error: 'Falta el pathname' }, { status: 400 });
  }

  try {
    await del(pathname);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 });
  }
}