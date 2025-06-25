import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file || file.includes('..')) {
    return new Response(JSON.stringify({ error: 'Ruta inválida' }), { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'cms', file);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return new Response(JSON.stringify({ content }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Archivo no encontrado' }), { status: 404 });
  }
}