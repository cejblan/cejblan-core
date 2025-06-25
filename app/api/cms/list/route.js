import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const dirPath = path.join(process.cwd(), 'cms');

  try {
    const files = await fs.readdir(dirPath);
    return new Response(JSON.stringify({ files }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'No se pudieron listar los archivos' }), { status: 500 });
  }
}
