const fs = require("fs");
const path = require("path");

const pluginsDir = path.join(process.cwd(), "app", "admin", "plugins");
const outputPath = path.join(process.cwd(), "middleware.plugins.json");

const folders = fs.readdirSync(pluginsDir);
const pluginRoles = {};

for (const folder of folders) {
  const configPath = path.join(pluginsDir, folder, "plugin.config.json");

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(raw);
    const roles = Array.isArray(config.role)
      ? config.role.map(r => r.trim().toLowerCase()) // 👈 normaliza arrays también
      : (config.role || "")
          .split(",")
          .map(r => r.trim().toLowerCase())
          .filter(Boolean);

    pluginRoles[`/admin/${folder}`] = roles;
  } catch (err) {
    console.warn(`⚠️ Error leyendo plugin ${folder}: ${err.message}`);
  }
}

fs.writeFileSync(outputPath, JSON.stringify(pluginRoles, null, 2));
console.log(`✅ middleware.plugins.json generado correctamente.`);
