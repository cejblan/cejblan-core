import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req, res) {
  try {
    const activado = "Activado";
    const [results] = await conexion.query("SELECT name, data FROM categories WHERE status = ?", activado);

    // Devuelve la respuesta con los encabezados configurados dentro de NextResponse
    return NextResponse.json(results, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const [result] = await conexion.query("INSERT INTO categories SET ?", {
      name: data.get("name"),
      data: data.get("data"),
      status: data.get("status"),
    });

    return NextResponse.json({
      name: data.get("name"),
      data: data.get("data"),
      status: data.get("status"),
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}