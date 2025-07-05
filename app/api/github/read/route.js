import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(req) {
  const { path } = await req.json();
  if (!path) {
    return new Response(
      JSON.stringify({ error: 'Falta el campo "path"' }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const ownerRepo = process.env.GITHUB_REPO;
  const [owner, repo] = ownerRepo.split("/");
  const branch = "develop";

  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!response.data.content) {
      return new Response(
        JSON.stringify({ error: "Archivo sin contenido" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const content = Buffer.from(response.data.content, "base64").toString("utf-8");

    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al leer archivo:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo obtener el archivo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
