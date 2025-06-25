import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const body = await request.json();
  const { file, content } = body;

  if (!file || file.includes('..')) {
    return new Response(JSON.stringify({ error: 'Ruta inválida' }), { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'cms', file);

  try {
    await fs.writeFile(filePath, content);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al guardar' }), { status: 500 });
  }
}
