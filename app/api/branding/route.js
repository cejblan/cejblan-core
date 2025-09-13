import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const filePath = path.resolve(process.cwd(), "config/themes.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "develop";
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || "config/themes.json";

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
    const content = await readFile(filePath, "utf-8");
    const json = JSON.parse(content);
    return NextResponse.json(json);
  } catch (error) {
    console.error("Error al leer themes.json:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { palette, logo, logo2, logo3, fondo, img404, img500, navbar, footer, loading, background } = await req.json();

    // Validaciones básicas
    if (!Array.isArray(palette) || typeof logo !== "string") {
      return NextResponse.json(
        { error: "Datos inválidos (palette o logo)" },
        { status: 400 }
      );
    }

    if (
      typeof navbar !== "string" ||
      typeof footer !== "string" ||
      typeof loading !== "string" ||
      typeof background !== "string"
      ) {
      return NextResponse.json(
        { error: "Datos inválidos (navbar, footer o loading)" },
        { status: 400 }
      );
    }

    if (logo2 && typeof logo2 !== "string") {
      return NextResponse.json(
        { error: "Datos inválidos (logo2 debe ser string)" },
        { status: 400 }
      );
    }

    if (logo3 && typeof logo3 !== "string") {
      return NextResponse.json(
        { error: "Datos inválidos (logo3 debe ser string)" },
        { status: 400 }
      );
    }

    if (fondo && typeof fondo !== "string") {
      return NextResponse.json(
        { error: "Datos inválidos (fondo debe ser string)" },
        { status: 400 }
      );
    }

    if (img404 && typeof img404 !== "string") {
      return NextResponse.json(
        { error: "Datos inválidos (img404 debe ser string)" },
        { status: 400 }
      );
    }

    if (img500 && typeof img500 !== "string") {
      return NextResponse.json(
        { error: "Datos inválidos (img500 debe ser string)" },
        { status: 400 }
      );
    }

    // Construcción de datos nuevos (incluye img404 e img500)
    const newData = {
      palette,
      logo,
      logo2: logo2 || "",
      logo3: logo3 || "",
      fondo: fondo || "",
      img404: img404 || "",
      img500: img500 || "",
      navbar,
      footer,
      loading,
      background,
    };

    const contentEncoded = Buffer.from(
      JSON.stringify(newData, null, 2)
    ).toString("base64");

    const sha = await getFileSHA();

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Actualizar themes.json desde la API",
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
