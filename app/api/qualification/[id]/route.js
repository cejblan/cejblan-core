import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req, { params }) {
  const connection = await conexion.getConnection();
  try {
    const [result] = await connection.query("SELECT value FROM qualification WHERE product = ?", [
      params.id,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "Calificación no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(result[0], {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function DELETE(request, { params }) {
  const connection = await conexion.getConnection();
  try {
    const [result] = await connection.query("DELETE FROM qualification WHERE id = ?", [
      params.id,
    ]);
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Forma de entrega no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function PUT(request, { params }) {
  const connection = await conexion.getConnection();
  try {
    const data = await request.formData();
    const updateData = {
      name: data.get("name"),
      data: data.get("data"),
      status: data.get("status"),
    };

    if (!data.get("name")) {
      return NextResponse.json(
        {
          message: "Name is required",
        },
        {
          status: 400,
        }
      );
    }

    const [result] = await connection.query("UPDATE qualification SET ? WHERE id = ?", [
      updateData,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Forma de entrega no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    const [updatedProduct] = await connection.query(
      "SELECT * FROM qualification WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(updatedProduct[0]);

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
