import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "develop";
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || "config/branding.json";

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

async function getFileSHA() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("No se pudo obtener SHA del archivo.");
  const json = await res.json();
  return json.sha;
}

export async function GET() {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, { headers });
    const json = await res.json();

    const content = Buffer.from(json.content, "base64").toString("utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Error al leer archivo desde GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { palette, logo, navbar, footer, loading } = await req.json();

    if (!Array.isArray(palette) || typeof logo !== "string") {
      return NextResponse.json({ error: "Datos inválidos (palette o logo)" }, { status: 400 });
    }

    if (
      typeof navbar !== "string" ||
      typeof footer !== "string" ||
      typeof loading !== "string"
    ) {
      return NextResponse.json({ error: "Datos inválidos (navbar, footer o loading)" }, { status: 400 });
    }

    const newData = { palette, logo, navbar, footer, loading };
    const contentEncoded = Buffer.from(JSON.stringify(newData, null, 2)).toString("base64");

    const sha = await getFileSHA();

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Actualizar branding.json desde la API",
        content: contentEncoded,
        sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error al hacer commit en GitHub:", errorData);
      return NextResponse.json({ error: "Fallo al escribir en GitHub" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al escribir en GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
