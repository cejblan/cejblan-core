import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import AdmZip from "adm-zip";
import unzipper from "unzipper";

const UPDATE_SERVER = "http://localhost:3330/api/versions/update-info";
const ROOT_PATH = process.cwd();
const BACKUP_PATH = path.join(ROOT_PATH, "backups");
const PACKAGE_JSON_PATH = path.join(ROOT_PATH, "package.json");

// === GET: Verificar si hay una nueva versión ===
export async function GET() {
  try {
    const res = await fetch(UPDATE_SERVER);
    if (!res.ok) throw new Error(`Error al obtener info de actualización: ${res.status}`);
    const updateInfo = await res.json();

    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
    const currentVersion = packageJson.version || "0.0.0";

    return new Response(JSON.stringify({
      currentVersion,
      latestVersion: updateInfo.version,
      changelog: updateInfo.changelog,
      hasUpdate: updateInfo.version !== currentVersion
    }), { status: 200 });

  } catch (err) {
    console.error("Error verificando actualizaciones:", err);
    return new Response(JSON.stringify({
      success: false,
      message: err.message
    }), { status: 500 });
  }
}

// === POST: Descargar e instalar nueva versión ===
export async function POST() {
  try {
    const res = await fetch(UPDATE_SERVER);
    if (!res.ok) throw new Error(`Error al obtener info de actualización: ${res.status}`);
    const updateInfo = await res.json();

    const zipPath = path.join(ROOT_PATH, "update.zip");

    // Descargar ZIP
    const zipRes = await fetch(updateInfo.url);
    if (!zipRes.ok) throw new Error(`Error al descargar el ZIP: ${zipRes.status}`);
    const buffer = Buffer.from(await zipRes.arrayBuffer());
    fs.writeFileSync(zipPath, buffer);
    console.log("ZIP descargado.");

    // Crear backup de la raíz
    if (!fs.existsSync(BACKUP_PATH)) fs.mkdirSync(BACKUP_PATH, { recursive: true });
    const backupZipPath = path.join(BACKUP_PATH, `backup-${Date.now()}.zip`);
    const backupZip = new AdmZip();
    backupZip.addLocalFolder(ROOT_PATH, "", (filename) => {
      // Excluir backups y ZIP temporal
      return !filename.includes("backups") && !filename.includes("update.zip");
    });
    backupZip.writeZip(backupZipPath);
    console.log("Backup creado en:", backupZipPath);

    // Extraer ZIP directamente en la raíz
    const directory = await unzipper.Open.buffer(buffer);
    await Promise.all(directory.files.map(async (file) => {
      if (file.type === "File") {
        const filePath = path.join(ROOT_PATH, file.path);
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        const content = await file.buffer();
        fs.writeFileSync(filePath, content);
      }
    }));

    console.log("ZIP extraído.");

    // Actualizar versión en package.json
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
    packageJson.version = updateInfo.version;
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2), "utf8");

    // Borrar ZIP temporal
    fs.unlinkSync(zipPath);

    return new Response(JSON.stringify({
      success: true,
      message: "Actualización instalada con éxito"
    }), { status: 200 });

  } catch (err) {
    console.error("Error instalando actualización:", err);
    return new Response(JSON.stringify({
      success: false,
      message: err.message
    }), { status: 500 });
  }
}
