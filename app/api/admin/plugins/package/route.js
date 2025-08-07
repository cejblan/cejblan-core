import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createSign } from 'crypto';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export async function POST(request) {
  try {
    const { pluginName, domain = '' } = await request.json();
    const root = process.cwd();
    const pluginsDir = path.join(root, 'app', 'admin', 'plugins');
    const pluginDir = path.join(pluginsDir, pluginName);

    if (!fs.existsSync(pluginDir)) {
      return NextResponse.json({ error: 'Plugin no encontrado' }, { status: 404 });
    }

    // Leer configuración del plugin
    const config = JSON.parse(
      fs.readFileSync(path.join(pluginDir, 'plugin.config.json'), 'utf8')
    );

    // Sólo generamos license.json si el plugin no es gratuito
    let license = null;
    if (config.price > 0) {
      const issuedAt = new Date().toISOString();
      const expiresAt = '9999-12-31T23:59:59Z';
      const licensePayload = {
        domain,
        issuedAt,
        expiresAt,
        pluginVersion: config.version
      };
      const privateKey = fs.readFileSync(path.join(root, 'keys', 'private.pem'), 'utf8');
      const signer = createSign('RSA-SHA256');
      signer.update(JSON.stringify(licensePayload));
      const signature = signer.sign(privateKey, 'base64');
      license = { ...licensePayload, signature };
    }

    // Crear el ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    archive.pipe(stream);

    // Agregar la carpeta del plugin
    archive.directory(pluginDir + '/', pluginName);

    // Agregar license.json si existe
    if (license) {
      archive.append(JSON.stringify(license, null, 2), {
        name: `${pluginName}/license.json`
      });
    }

    // Incluir clave pública y WASM
    archive.file(path.join(root, 'keys', 'public.pem'), {
      name: `${pluginName}/public.pem`
    });
    archive.directory(path.join(root, 'public', 'wasm'), `${pluginName}/wasm`);

    await archive.finalize();

    return new Response(stream.read(), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${pluginName}.zip"`
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error al empaquetar plugin' },
      { status: 500 }
    );
  }
}
