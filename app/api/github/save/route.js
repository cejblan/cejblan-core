import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(req) {
  try {
    const { path, content, commitMessage, description } = await req.json();

    if (!path || !content || !commitMessage) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [owner, repo] = process.env.GITHUB_REPO.split("/");

    // 1. Obtener el SHA actual del archivo
    const getRes = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: process.env.GITHUB_BRANCH,
    });

    const sha = getRes.data.sha;

    // 2. Codificar el nuevo contenido a base64
    const encodedContent = Buffer.from(content, "utf-8").toString("base64");

    // 3. Crear o actualizar el archivo con un commit
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `(CMS) ${commitMessage}${description ? `\n\n${description}` : ''}`,
      content: encodedContent,
      sha,
      branch,
      committer: {
        name: "CMS Bot",
        email: "cms@example.com",
      },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al guardar en GitHub:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo guardar en GitHub" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
