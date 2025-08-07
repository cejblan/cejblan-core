const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const generateLicense = require('@/libs/plugins/generate-license');

export async function POST(req) {
  const { pluginName, rute, domain } = await req.json();

  if (!pluginName) {
    return new Response('pluginName is required', { status: 400 });
  }
  if (!rute) {
    return new Response('rute (folder name) is required', { status: 400 });
  }

  const pluginDir = path.resolve(process.cwd(), 'app', 'admin', 'plugins', rute);
  if (!fs.existsSync(pluginDir)) {
    return new Response(`Plugin folder not found: ${rute}`, { status: 404 });
  }

  const configPath = path.join(pluginDir, 'plugin.config.json');
  if (!fs.existsSync(configPath)) {
    return new Response('Missing plugin.config.json', { status: 500 });
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const price = Number(config.price || 0);

  if (price > 0 && (!domain || typeof domain !== 'string' || domain.trim() === '')) {
    return new Response('domain is required for paid plugins', { status: 400 });
  }

  const { license, signature } = generateLicense(domain || '');
  const tempDir = path.resolve(process.cwd(), 'temp');
  const zipPath = path.join(tempDir, `${rute}.zip`);
  fs.mkdirSync(tempDir, { recursive: true });

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);

  // Incluir carpeta del plugin
  archive.directory(pluginDir, rute);

  // Incluir WASM si existe
  const wasmDir = path.resolve(process.cwd(), 'public', 'wasm');
  if (fs.existsSync(wasmDir)) {
    archive.directory(wasmDir, 'wasm');
  }

  // Incluir clave pública y licencia
  archive.file(path.resolve(process.cwd(), 'keys', 'public.pem'), { name: 'public.pem' });
  archive.append(JSON.stringify({ license, signature }), { name: 'license.json' });

  // Finalizar el zip y esperar a que termine de escribir
  await archive.finalize();
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });

  const zipData = fs.readFileSync(zipPath);
  fs.unlinkSync(zipPath);

  return new Response(zipData, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${rute}.zip"`
    }
  });
}
