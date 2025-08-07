const fetch = require('node-fetch');      // npm install node-fetch
const AdmZip = require('adm-zip');        // npm install adm-zip
const fs = require('fs');
const path = require('path');

/**
 * Descarga el ZIP del plugin desde la tienda y lo instala
 * en la carpeta local ./plugins/[pluginName]
 *
 * @param {string} pluginName  Nombre del plugin (campo pluginName en tu API)
 * @param {string} ruta        Nombre de carpeta real en ZIP (campo ruta en tu API)
 * @param {string} storeUrl    URL base de tu tienda (ej: https://mi-tienda.com)
 * @param {string} domain      Dominio donde se usará el plugin
 */
async function installPlugin(pluginName, ruta, storeUrl, domain) {
  try {
    // 1) Llamada POST a tu tienda para obtener el ZIP
    const res = await fetch(`${storeUrl}/api/admin/plugins/package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginName, ruta, domain })
    });
    if (!res.ok) {
      throw new Error(`Tienda respondió con ${res.status}: ${await res.text()}`);
    }

    // 2) Recibe el ZIP como ArrayBuffer y guárdalo temporalmente
    const arrayBuffer = await res.arrayBuffer();
    const tmpZipPath = path.join(__dirname, `${ruta}.zip`);
    fs.writeFileSync(tmpZipPath, Buffer.from(arrayBuffer));
    console.log(`✅ ZIP descargado a ${tmpZipPath}`);

    // 3) Extrae el ZIP en la carpeta ./plugins/[ruta]
    const extractDir = path.join(__dirname, 'plugins', ruta);
    const zip = new AdmZip(tmpZipPath);
    zip.extractAllTo(extractDir, /*overwrite*/ true);
    console.log(`✅ Plugin extraído en ${extractDir}`);

    // 4) Limpieza: borrar el ZIP temporal
    fs.unlinkSync(tmpZipPath);
    console.log(`🗑 ZIP temporal eliminado`);

    // 5) (Opcional) Registrar en plugins.json
    const registryPath = path.join(__dirname, 'plugins', 'plugins.json');
    let registry = [];
    if (fs.existsSync(registryPath)) {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    }
    if (!registry.includes(ruta)) {
      registry.push(ruta);
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
      console.log(`📑 Registrado plugin '${ruta}' en plugins/plugins.json`);
    }

    console.log(`🎉 Plugin "${pluginName}" instalado correctamente.`);
  } catch (err) {
    console.error('❌ Error instalando plugin:', err);
    process.exit(1);
  }
}

// CLI: node install-plugin.js <pluginName> <ruta> <storeUrl> <domain>
if (require.main === module) {
  const [,, pluginName, ruta, storeUrl, domain] = process.argv;
  if (!pluginName || !ruta || !storeUrl || !domain) {
    console.error('Uso: node install-plugin.js <pluginName> <ruta> <storeUrl> <domain>');
    process.exit(1);
  }
  installPlugin(pluginName, ruta, storeUrl, domain);
}
