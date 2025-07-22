import fs from "fs";
import path from "path";

export function loadPlugins() {
  const pluginsDir = path.join(process.cwd(), "app", "admin", "plugins");

  if (!fs.existsSync(pluginsDir)) {
    console.warn(`No existe el directorio de plugins en: ${pluginsDir}`);
    return [];
  }

  const folders = fs.readdirSync(pluginsDir);
  const plugins = [];
  const slugs = new Set();
  const validSlugRegex = /^[a-z0-9-]+$/;

  for (const folder of folders) {
    const configPath = path.join(pluginsDir, folder, "plugin.config.json");

    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(raw);

      const slug = config.slug || folder;

      // Verifica si el slug es válido
      if (!validSlugRegex.test(slug)) {
        console.warn(`❌ Slug inválido: "${slug}" (en carpeta "${folder}"). Solo se permiten letras minúsculas, números y guiones. Este plugin será omitido.`);
        continue;
      }

      // Verifica si el slug está duplicado
      if (slugs.has(slug)) {
        console.warn(`⚠️ Slug duplicado detectado: "${slug}" (en carpeta "${folder}"). Este plugin será omitido.`);
        continue;
      }

      slugs.add(slug);

      plugins.push({
        slug,
        ...config
      });

    } catch (err) {
      console.warn(`Error leyendo plugin "${folder}": ${err.message}`);
    }
  }

  return plugins;
}
