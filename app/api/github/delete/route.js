import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(req) {
  try {
    const body = await req.json();
    const paths = Array.isArray(body.paths) ? body.paths : null;
    const commitMessage = body.message || "Delete files (CMS)";
    const [owner, repo] = (process.env.GITHUB_REPO || "").split("/");
    const branch = body.branch || process.env.GITHUB_BRANCH || "develop";

    if (!paths || !paths.length) {
      return new Response(JSON.stringify({ error: "Se requiere 'paths' (array de rutas a eliminar)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: "GITHUB_REPO no configurado correctamente (owner/repo)" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener usuario autenticado para construir committer
    let committerName = "CMS Bot";
    let committerEmail = "noreply@users.noreply.github.com";
    try {
      const me = await octokit.rest.users.getAuthenticated();
      const login = me?.data?.login;
      const id = me?.data?.id;
      const nameFromProfile = me?.data?.name;

      committerName = nameFromProfile || login || committerName;

      if (id && login) {
        committerEmail = `${id}+${login}@users.noreply.github.com`;
      } else if (login) {
        committerEmail = `${login}@users.noreply.github.com`;
      }
    } catch (errAuth) {
      console.error("No se pudo obtener usuario autenticado. Usando fallback committer.", errAuth);
    }

    const results = [];

    for (const path of paths) {
      try {
        // Obtener SHA del archivo (obligatorio para delete)
        let sha = null;
        try {
          const getRes = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
          });

          if (getRes && getRes.data && getRes.data.sha) {
            sha = getRes.data.sha;
          } else {
            throw new Error("Archivo no encontrado o no es un archivo");
          }
        } catch (errGet) {
          if (errGet.status === 404) {
            results.push({ path, ok: false, error: "No encontrado (404)" });
            continue;
          } else {
            throw errGet;
          }
        }

        await octokit.rest.repos.deleteFile({
          owner,
          repo,
          path,
          message: `(CMS) ${commitMessage}`,
          sha,
          branch,
          committer: { name: committerName, email: committerEmail },
        });

        results.push({ path, ok: true });
      } catch (errFile) {
        console.error("Error eliminando archivo:", path, errFile);
        const msg = errFile?.message || JSON.stringify(errFile);
        results.push({ path, ok: false, error: msg });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error general en /api/github/delete:", error);
    return new Response(JSON.stringify({ error: "No se pudo procesar la petición", detail: error?.message || error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
