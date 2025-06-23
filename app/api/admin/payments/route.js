import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req, res) {
  const connection = await conexion.getConnection();
  try {
    const [results] = await connection.query("SELECT * FROM payments");
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function POST(request) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();
    const [result] = await connection.query("INSERT INTO payments SET ?", {
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}