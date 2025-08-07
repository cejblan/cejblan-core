// app/api/admin/plugins/upload/route.js
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    // 1) Parsear multipart/form-data con NextRequest.formData()
    const formData = await req.formData();
    const zipFile = formData.get('pluginZip');
    if (!zipFile || !(zipFile instanceof Blob)) {
      return new Response('No se recibió ningún archivo ZIP', { status: 400 });
    }

    // 2) Leer el ZIP desde el Blob
    const arrayBuffer = await zipFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3) Cargarlo en AdmZip
    const zip = new AdmZip(buffer);

    // 4) Nombre de carpeta: nombre del ZIP sin extensión
    //    zipFile.name funciona en navegadores, en Next 14+ es zipFile.name
    const originalName = zipFile.name || 'plugin';
    const baseName = path.basename(originalName, '.zip');
    const targetDir = path.resolve(process.cwd(), 'app', 'admin', 'plugins', baseName);

    // 5) Eliminar carpeta si existe y crearla
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

// 6) Extraer todas las entradas sin crear el folder raíz
zip.getEntries().forEach(entry => {
  // entry.entryName es algo como 'Monedas/file.js' o 'Monedas/sub/otro.txt'
  // eliminamos el primer segmento
  const parts = entry.entryName.split('/');
  parts.shift(); // quita 'Monedas'
  const flattened = parts.join('/');

  if (!flattened) return;
  const destPath = path.join(targetDir, flattened);

  if (entry.isDirectory) {
    fs.mkdirSync(destPath, { recursive: true });
  } else {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, entry.getData());
  }
});


    // 7) Verificar existencia de plugin.config.json
    const configPath = path.join(targetDir, 'plugin.config.json');
    if (!fs.existsSync(configPath)) {
      return new Response('ZIP inválido: falta plugin.config.json', { status: 400 });
    }

    // 8) Responder éxito
    return new Response(
      JSON.stringify({ success: true, folder: baseName }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error en upload/route.js:', err);
    return new Response(`Error al instalar plugin: ${err.message}`, { status: 500 });
  }
}
