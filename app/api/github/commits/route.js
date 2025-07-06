// app/api/github/commits/route.js

import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = process.env.GITHUB_REPO.split("/");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file) {
    return new Response(JSON.stringify({ error: "Falta parámetro file" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await octokit.rest.repos.listCommits({
      owner,
      repo,
      path: file,
      sha: process.env.GITHUB_BRANCH,
      per_page: 9,
    });

    const commits = res.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.author.date,
    }));

    return new Response(JSON.stringify(commits), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener commits:", error);
    return new Response(JSON.stringify({ error: "No se pudieron obtener los commits" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
