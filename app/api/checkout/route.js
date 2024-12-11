import { NextResponse } from "next/server";
import { conexion2 } from "@/libs/mysql";

export async function GET(req, res) {
  try {
    const activado = "Activado";
    const results = [];
    results.push(await conexion2.query("SELECT name, data FROM payments WHERE status = ?", activado));
    results.push(await conexion2.query("SELECT name, data FROM deliveries WHERE status = ?", activado));

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
  } finally {
    await conexion2.end();
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const result = await conexion2.query("INSERT INTO payments SET ?", {
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
  } finally {
    await conexion2.end();
  }
}