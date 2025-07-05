import { Octokit } from "octokit";

export async function GET() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const [owner, repo] = process.env.GITHUB_REPO.split("/");

  try {
    const folders = ["components/pages", "components/editable"];
    let files = [];

    for (const folder of folders) {
      const res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: folder,
      });      

      res.data.forEach(item => {
        if (item.type === "file") files.push(`${folder}/${item.name}`);
      });
    }

    return new Response(JSON.stringify({ files }), { status: 200 });
  } catch (err) {
    console.error("Error al obtener archivos:", err);
    return new Response(JSON.stringify({ error: "No se pudieron cargar archivos" }), { status: 500 });
  }
}
