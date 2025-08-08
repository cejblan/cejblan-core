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
    // 1) Recibir el archivo ZIP
    const formData = await req.formData();
    const zipFile = formData.get('pluginZip');
    if (!zipFile || !(zipFile instanceof Blob)) {
      return new Response('No se recibió ningún archivo ZIP', { status: 400 });
    }

    // 2) Leer el contenido binario del ZIP
    const arrayBuffer = await zipFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);

    // 3) Definir nombre base y directorio destino
    const originalName = zipFile.name || 'plugin';
    const baseName = path.basename(originalName, '.zip');
    const targetDir = path.resolve(process.cwd(), 'app', 'admin', 'plugins', baseName);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    // 4) Buscar license.json sin importar la ruta interna
    const licenseEntry = zip.getEntries().find(entry =>
      path.basename(entry.entryName).toLowerCase() === 'license.json'
    );

    if (!licenseEntry) {
      return new Response('ZIP inválido: falta license.json', { status: 400 });
    }

    // 5) Validar dominio contra el archivo license.json
    const licenseContent = JSON.parse(licenseEntry.getData().toString('utf-8'));
    const allowedDomain = licenseContent.license?.domain?.replace(/^https?:\/\//, '').toLowerCase();
    const currentDomain = req.headers.get('host')?.toLowerCase();

    const mensajeConcientizacion = `
Este plugin está protegido por una licencia que valida el dominio autorizado.

Por favor, respeta el trabajo de los desarrolladores de código abierto y también el esfuerzo de quienes dedican tiempo a crear soluciones de calidad, incluso cuando son de pago.

Apoyar el software legalmente permite que más herramientas útiles continúen existiendo y mejorando para todos.
    `.trim();

    if (!allowedDomain || !currentDomain || currentDomain !== allowedDomain) {
      return new Response(
        `Dominio no autorizado.\nEste plugin solo puede instalarse en: ${allowedDomain}\n\n${mensajeConcientizacion}`,
        { status: 403 }
      );
    }

    // 6) Extraer los archivos ignorando carpeta raíz
    zip.getEntries().forEach(entry => {
      const parts = entry.entryName.split('/');
      parts.shift(); // eliminar carpeta raíz (si existe)
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
      fs.rmSync(targetDir, { recursive: true, force: true });
      return new Response('ZIP inválido: falta plugin.config.json', { status: 400 });
    }

    // 8) Final: respuesta con éxito
    return new Response(JSON.stringify({ success: true, folder: baseName }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en upload/route.js:', err);
    return new Response(`Error al instalar plugin: ${err.message}`, { status: 500 });
  }
}
