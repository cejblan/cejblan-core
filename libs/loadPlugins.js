import fs from "fs";
import path from "path";

export function loadPlugins() {
  // Ahora apunta a app/admin/plugins
  const pluginsDir = path.join(process.cwd(), "app", "admin", "plugins");
  if (!fs.existsSync(pluginsDir)) {
    console.warn(`No existe el directorio de plugins en: ${pluginsDir}`);
    return [];
  }

  const folders = fs.readdirSync(pluginsDir);
  const plugins = [];

  for (const folder of folders) {
    const configPath = path.join(pluginsDir, folder, "plugin.config.json");
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(raw);
      plugins.push({
        slug: folder,
        name: config.name || folder,
        icon: config.icon || null,
        role: config.role || "admin",
      });
    } catch (err) {
      console.warn(`Error leyendo plugin "${folder}": ${err.message}`);
    }
  }

  return plugins;
}
