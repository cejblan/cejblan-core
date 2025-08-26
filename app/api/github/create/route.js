import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(req) {
  try {
    const body = await req.json();

    let files = [];
    if (Array.isArray(body.files)) files = body.files;
    else if (body.file && body.file.path && typeof body.file.content !== "undefined") files = [body.file];
    else {
      return new Response(JSON.stringify({ error: "Se requiere 'files' (array) o 'file' (objeto) con path y content" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const commitMessage = body.message || "Create/Update files (CMS)";
    const description = body.description || "";
    const [owner, repo] = (process.env.GITHUB_REPO || "").split("/");
    const branch = body.branch || process.env.GITHUB_BRANCH || "develop";

    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: "GITHUB_REPO no configurado correctamente (owner/repo)" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener usuario autenticado para construir committer/author (ID+LOGIN noreply)
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

    for (const f of files) {
      const { path, content } = f;
      if (!path || typeof content === "undefined") {
        results.push({ path: path || null, ok: false, error: "Faltan campos path o content" });
        continue;
      }

      try {
        // Si el archivo es un componente en components/pages/*.jsx, reconstruimos el contenido
        // para incluir los comentarios EXACTAMENTE dentro del return(...) como solicitaste.
        let contentToWrite = content;
        const compMatch = path.match(/^components\/pages\/([A-Za-z0-9_]+)\.jsx$/);
        if (compMatch) {
          const pascal = compMatch[1];

          // Intentar extraer texto dentro de <div>...</div> del content entrante como "descripción"
          let desc = "";
          try {
            const divMatch = String(content).match(/<div[^>]*>([\s\S]*?)<\/div>/);
            if (divMatch && typeof divMatch[1] !== "undefined") {
              desc = divMatch[1].trim();
            }
          } catch (e) {
            desc = "";
          }

          // Safe escape
          const safeDesc = String(desc).replace(/\\/g, "\\\\").replace(/\r/g, "").replace(/\n/g, " ").replace(/"/g, '\\"');

          contentToWrite = `export default function ${pascal}() {
  return (
    // ===START_RETURN===
    
    <div>${safeDesc}</div>
    // ===END_RETURN===
  )
}
`;
        }

        // Obtener SHA actual (si existe)
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
          }
        } catch (errGet) {
          if (errGet.status && errGet.status !== 404) {
            throw errGet;
          }
        }

        const encodedContent = Buffer.from(String(contentToWrite), "utf-8").toString("base64");

        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path,
          message: `(CMS) ${commitMessage}${description ? `\n\n${description}` : ""}`,
          content: encodedContent,
          sha: sha || undefined,
          branch,
          committer: { name: committerName, email: committerEmail },
          author: { name: committerName, email: committerEmail },
        });

        results.push({ path, ok: true });
      } catch (errFile) {
        console.error("Error creando/actualizando archivo:", path, errFile);
        const msg = errFile?.message || JSON.stringify(errFile);
        results.push({ path, ok: false, error: msg });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error general en /api/github/create:", error);
    return new Response(JSON.stringify({ error: "No se pudo procesar la petición", detail: error?.message || error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
