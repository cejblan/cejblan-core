import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Falta email" }, { status: 400 });
    }

    const [result] = await conexion.query("SELECT * FROM users WHERE email = ?", [email]);

    if (result.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}