import { Octokit } from "octokit";

export async function GET(req) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const [owner, repo] = (process.env.GITHUB_REPO || "").split("/");

  try {
    const url = new URL(req.url);
    const branch = url.searchParams.get("branch") || process.env.GITHUB_BRANCH || "main";

    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: "GITHUB_REPO no configurado correctamente (owner/repo)" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const folders = ["components/pages", "components/editable"];
    const files = [];

    // función recursiva que lista archivos dentro de una ruta dada en la rama solicitada
    async function listRecursively(path) {
      try {
        const res = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
          owner,
          repo,
          path,
          ref: branch,
        });

        // si es archivo único (no suele ocurrir para carpetas), lo añadimos
        if (!Array.isArray(res.data)) {
          files.push(res.data.path);
          return;
        }

        // si es array: iterar
        for (const item of res.data) {
          if (item.type === "file") {
            files.push(item.path);
          } else if (item.type === "dir") {
            // recursividad dentro del mismo folder permitido
            await listRecursively(item.path);
          }
        }
      } catch (err) {
        // si no existe la carpeta en la rama (404) la ignoramos; otros errores los logeamos
        if (err.status === 404) {
          // carpeta no existe en esta rama - ignorar
          return;
        } else {
          console.error(`Error listando ${path} en branch ${branch}:`, err);
          throw err;
        }
      }
    }

    // listar únicamente las carpetas autorizadas
    for (const folder of folders) {
      await listRecursively(folder);
    }

    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error al obtener archivos:", err);
    return new Response(JSON.stringify({ error: "No se pudieron cargar archivos", detail: err?.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
