import { readdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const editableDir = path.resolve(process.cwd(), "components/editable");

export async function GET() {
  try {
    const files = await readdir(editableDir);
    // obtener solo el nombre sin extension
    const names = files.map((f) => path.parse(f).name);

    const navs = [];
    const foots = [];
    const loads = [];

    names.forEach((name) => {
      const m = name.match(/^(navbar|footer|loading)(\d+)$/i);
      if (!m) return;
      const key = m[1].toLowerCase();
      const num = parseInt(m[2], 10);
      const label = `${key}${num}`;
      if (key === "navbar") navs.push({ name: label, num });
      if (key === "footer") foots.push({ name: label, num });
      if (key === "loading") loads.push({ name: label, num });
    });

    const sortByNum = (a, b) => a.num - b.num;
    navs.sort(sortByNum);
    foots.sort(sortByNum);
    loads.sort(sortByNum);

    return NextResponse.json({
      navbar: navs.map((x) => x.name),
      footer: foots.map((x) => x.name),
      loading: loads.map((x) => x.name),
    });
  } catch (err) {
    console.error("Error leyendo components/editable:", err);
    // Devolvemos arrays vacíos para no romper el cliente; también enviamos error por si quieres loggear
    return NextResponse.json(
      { navbar: [], footer: [], loading: [], error: err.message },
      { status: 200 }
    );
  }
}
