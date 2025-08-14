import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import crypto from "crypto";
import fetch from "node-fetch";

const UPDATE_SERVER = "http://localhost:3330/api/versions/update-info";
const CORE_PATH = path.join(process.cwd(), "core");
const BACKUP_PATH = path.join(process.cwd(), "backups");
const PACKAGE_JSON_PATH = path.join(process.cwd(), "package.json");

// === GET: Verificar si hay una nueva versión ===
export async function GET() {
  try {
    // Obtener info de actualización desde el servidor remoto
    const res = await fetch(UPDATE_SERVER);
    if (!res.ok) {
      throw new Error(`Error al obtener info de actualización: ${res.status}`);
    }
    const updateInfo = await res.json();

    // Leer versión desde package.json
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
    // Obtener info de actualización
    const res = await fetch(UPDATE_SERVER);
    if (!res.ok) {
      throw new Error(`Error al obtener info de actualización: ${res.status}`);
    }
    const updateInfo = await res.json();

    const zipPath = path.join(process.cwd(), "update.zip");

    // Descargar archivo
    const zipRes = await fetch(updateInfo.url);
    if (!zipRes.ok) {
      throw new Error(`Error al descargar el ZIP: ${zipRes.status}`);
    }
    const fileStream = fs.createWriteStream(zipPath);
    await new Promise((resolve, reject) => {
      zipRes.body.pipe(fileStream);
      zipRes.body.on("error", reject);
      fileStream.on("finish", resolve);
    });

    // Verificar integridad (MD5)
    const hash = crypto.createHash("md5").update(fs.readFileSync(zipPath)).digest("hex");
    if (hash !== updateInfo.hash) {
      fs.unlinkSync(zipPath);
      throw new Error("Archivo corrupto: el hash no coincide");
    }

    // Crear backup del core actual
    if (!fs.existsSync(BACKUP_PATH)) fs.mkdirSync(BACKUP_PATH);
    const backupZip = new AdmZip();
    backupZip.addLocalFolder(CORE_PATH);
    backupZip.writeZip(path.join(BACKUP_PATH, `core-backup-${Date.now()}.zip`));

    // Reemplazar core con el nuevo
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(CORE_PATH, true);

    // Actualizar versión en package.json
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
    packageJson.version = updateInfo.version;
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2), "utf8");

    // Borrar archivo temporal
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
