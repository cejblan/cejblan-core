import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = process.env.GITHUB_REPO.split("/");

export async function POST() {
  try {
    const res = await octokit.rest.repos.merge({
      owner,
      repo,
      base: "main",
      head: process.env.GITHUB_BRANCH,
      commit_message: "Publicación automática desde develop a main",
    });

    return Response.json({ ok: true, merged: res.data.merged });
  } catch (error) {
    console.error("Error al hacer merge:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
