// app/api/versions/update-to-github/route.js
import { Octokit } from "octokit";
import AdmZip from "adm-zip";
import fetch from "node-fetch";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
// URL del servidor de actualizaciones (fallback si no viene zipUrl)
const UPDATE_SERVER = process.env.UPDATE_SERVER || "https://cejblan.vercel.app/api/versions/update-info";

export async function POST(req) {
  try {
    const body = await req.json();
    // body may contain: zipUrl, commitMessage, description, version
    let { zipUrl, commitMessage, description, version } = body || {};

    console.log("POST /api/versions/update-to-github body:", { zipUrl, commitMessage, version });

    // Si no viene zipUrl, consultamos al servidor de actualizaciones
    if (!zipUrl) {
      console.log("No se recibió zipUrl en body — consultando UPDATE_SERVER:", UPDATE_SERVER);
      const resInfo = await fetch(UPDATE_SERVER);
      if (!resInfo.ok) {
        const text = await resInfo.text().catch(()=>null);
        console.error("Error al obtener update-info:", resInfo.status, text);
        return new Response(JSON.stringify({ error: "No se pudo obtener info de actualizaciones desde el servidor" }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
      const info = await resInfo.json().catch(() => null);
      console.log("Respuesta del servidor de actualizaciones:", info);

      // Probar varios nombres comunes de campo donde puede estar la URL
      zipUrl = info?.zipUrl || info?.url || info?.downloadUrl || info?.latestUrl || null;
      // Si commitMessage no fue enviado, podemos formar uno básico usando la info
      if (!commitMessage) {
        const ver = version || info?.version || "unknown";
        commitMessage = `Actualización desde CMS a ${ver}`;
      }
      // También tomar description del info si no vino
      if (!description) description = info?.changelog || info?.notes || "";
    }

    if (!zipUrl) {
      console.error("Falta zipUrl tras consultar servidores. Body e info:", body);
      return new Response(JSON.stringify({ error: "zipUrl no provisto y no se encontró en el servidor de actualizaciones" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (!commitMessage) commitMessage = `Actualización desde CMS ${version || ""}`;

    const [owner, repo] = (process.env.GITHUB_REPO || "").split("/");
    if (!owner || !repo) {
      console.error("GITHUB_REPO no configurado. valor:", process.env.GITHUB_REPO);
      return new Response(JSON.stringify({ error: "Configuración de repositorio inválida en servidor" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // 1) descargar el ZIP
    console.log("Descargando ZIP desde:", zipUrl);
    const zipRes = await fetch(zipUrl);
    if (!zipRes.ok) {
      const txt = await zipRes.text().catch(()=>null);
      console.error("Error al descargar el ZIP:", zipRes.status, txt);
      return new Response(JSON.stringify({ error: "No se pudo descargar el ZIP desde zipUrl" }), { status: 502, headers: { "Content-Type": "application/json" } });
    }
    const arrayBuffer = await zipRes.arrayBuffer();
    const zip = new AdmZip(Buffer.from(arrayBuffer));
    const entries = zip.getEntries();
    console.log(`ZIP tiene ${entries.length} entradas.`);

    // 2) Construir un solo commit con todos los cambios (usa git trees) -> más eficiente
    //  - Crea blobs para cada archivo, crea tree y commit en bloque.
    // Usamos la API Git de GitHub para evitar commits individuales.

    // 2.1 Obtener la referencia de la rama (SHA del commit actual)
    const branch = process.env.GITHUB_BRANCH || "main";
    const refRes = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const latestCommitSha = refRes.data.object.sha;
    console.log("Latest commit SHA:", latestCommitSha);

    // 2.2 Obtener el tree base del último commit
    const commitRes = await octokit.rest.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
    const baseTreeSha = commitRes.data.tree.sha;

    // 2.3 Crear blobs y añadir sus entries al tree
    const treeEntries = [];
    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const filePath = entry.entryName.replace(/^\/+/, "");
      const contentBuffer = entry.getData();
      const contentBase64 = contentBuffer.toString("base64");

      // Crear blob
      const blobRes = await octokit.rest.git.createBlob({
        owner,
        repo,
        content: contentBase64,
        encoding: "base64",
      });

      treeEntries.push({
        path: filePath,
        mode: "100644",
        type: "blob",
        sha: blobRes.data.sha,
      });

      console.log("Preparado blob:", filePath);
    }

    if (treeEntries.length === 0) {
      return new Response(JSON.stringify({ success: false, message: "ZIP sin archivos a procesar" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // 2.4 Crear nuevo tree basado en baseTreeSha
    const createdTree = await octokit.rest.git.createTree({
      owner,
      repo,
      tree: treeEntries,
      base_tree: baseTreeSha,
    });

    // 2.5 Crear commit con ese tree
    const commitMessageFull = `(CMS) ${commitMessage}${description ? `\n\n${description}` : ""}`;
    const newCommit = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: commitMessageFull,
      tree: createdTree.data.sha,
      parents: [latestCommitSha],
    });

    // 2.6 Actualizar la referencia de la rama para apuntar al nuevo commit (push)
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.data.sha,
      force: false,
    });

    console.log("Commit creado y ref actualizada:", newCommit.data.sha);

    return new Response(JSON.stringify({ success: true, message: "Archivos actualizados en GitHub", commit: newCommit.data.sha }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error actualizando en GitHub:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
