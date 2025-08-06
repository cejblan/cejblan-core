import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const filePath = path.resolve(process.cwd(), "config/branding.json");

export async function GET() {
  try {
    const content = await readFile(filePath, "utf-8");
    const json = JSON.parse(content);
    return NextResponse.json(json);
  } catch (error) {
    console.error("Error al leer branding.json:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { palette, logo, navbar, footer, loading } = await req.json();

    // Validaciones básicas
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

    await writeFile(filePath, JSON.stringify(newData, null, 2), "utf-8");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al escribir branding.json:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
