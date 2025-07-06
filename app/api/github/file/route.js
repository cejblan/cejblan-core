import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const sha = searchParams.get("sha");

  if (!path || !sha) {
    return new Response(
      JSON.stringify({ error: "Faltan parámetros 'path' o 'sha'" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const [owner, repo] = process.env.GITHUB_REPO.split("/");

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: sha, // sha del commit
    });

    if (!data.content) {
      return new Response(
        JSON.stringify({ error: "No se encontró contenido en este commit" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const contentDecoded = Buffer.from(data.content, "base64").toString("utf-8");

    return new Response(
      JSON.stringify({ content: contentDecoded }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al leer archivo por sha:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo obtener el contenido del archivo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
