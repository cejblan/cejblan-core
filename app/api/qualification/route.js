import { NextResponse } from "next/server";
import { conexion2 } from "@/libs/mysql";

export async function GET(req, res) {
  try {
    const results = await conexion2.query("SELECT * FROM qualification");
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
    const result = await conexion2.query("INSERT INTO qualification SET ?", {
      product: data.get("product"),
      comment: data.get("comment"),
      user: data.get("user"),
      value: data.get("value"),
    });

    return NextResponse.json({
      id: result.insertId,
      product: data.get("product"),
      comment: data.get("comment"),
      user: data.get("user"),
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
    await conexion2.end();
  }
}