import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req, res) {
  try {
    const results = await conexion.query("SELECT * FROM settings");
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
    await conexion.end();
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const result = await conexion.query("INSERT INTO settings SET ?", {
      name: data.get("name"),
      data: data.get("data"),
      value: data.get("value"),
    });

    return NextResponse.json({
      name: data.get("name"),
      data: data.get("data"),
      value: data.get("value"),
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
    await conexion.end();
  }
}