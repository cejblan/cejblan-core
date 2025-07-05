import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const OWNER = process.env.GITHUB_REPO.split("/")[0];
const REPO = process.env.GITHUB_REPO.split("/")[1];
const BRANCH = "develop";

const RUTAS = ["components/pages", "components/editable"];

export default async function handler(req, res) {
  try {
    const archivos = [];

    for (const path of RUTAS) {
      const { data } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path,
        ref: BRANCH,
      });

      const archivosJS = data.filter(item => item.type === "file" && item.name.endsWith(".js"));

      for (const archivo of archivosJS) {
        archivos.push(`${path}/${archivo.name}`);
      }
    }

    res.status(200).json({ files: archivos });
  } catch (error) {
    console.error("Error al listar archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
}
