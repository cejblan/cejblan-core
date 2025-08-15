import { Octokit } from "octokit";
import AdmZip from "adm-zip";
import fetch from "node-fetch";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(req) {
  try {
    const { zipUrl, commitMessage, description } = await req.json();

    if (!zipUrl || !commitMessage) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [owner, repo] = process.env.GITHUB_REPO.split("/");

    // 1. Descargar el ZIP
    const zipRes = await fetch(zipUrl);
    if (!zipRes.ok) throw new Error("No se pudo descargar el ZIP");

    const buffer = await zipRes.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));

    // 2. Recorrer cada archivo del ZIP y actualizarlo en GitHub
    for (const entry of zip.getEntries()) {
      if (entry.isDirectory) continue;

      const path = entry.entryName;
      const content = entry.getData().toString("utf-8");

      let sha = undefined;
      try {
        const getRes = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: process.env.GITHUB_BRANCH,
        });
        sha = getRes.data.sha;
      } catch {
        sha = undefined; // Archivo nuevo
      }

      const encodedContent = Buffer.from(content, "utf-8").toString("base64");

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `(CMS) ${commitMessage}${description ? `\n\n${description}` : ''}`,
        content: encodedContent,
        sha,
        branch: process.env.GITHUB_BRANCH,
        committer: {
          name: "CMS Bot",
          email: "cms@example.com",
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Archivos actualizados en GitHub" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error actualizando en GitHub:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
