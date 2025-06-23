import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req, res) {
  const connection = await conexion.getConnection();
  try {
    const [results] = await connection.query("SELECT * FROM qualification");
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
    connection.release();
  }
}

export async function POST(request) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();
    const [result] = await connection.query("INSERT INTO qualification SET ?", {
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
    connection.release();
  }
}