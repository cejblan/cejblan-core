import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const SERVER_URL = "https://cejblan.vercel.app/";
const UPDATE_SERVER = "https://cejblan.vercel.app/api/versions/update-info";
const ROOT_PATH = process.cwd();
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
      zipUrl: SERVER_URL + updateInfo.url,
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