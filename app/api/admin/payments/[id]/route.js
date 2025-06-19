import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

export async function GET(req, { params }) {
  try {
    const [result] = await conexion.query("SELECT * FROM payments WHERE id = ?", [
      params.id,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "Forma de pago no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    // Devuelve la respuesta con los encabezados configurados dentro de NextResponse
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
  }
}

export async function DELETE(request, { params }) {
  try {
    const [result] = await conexion.query("DELETE FROM payments WHERE id = ?", [
      params.id,
    ]);
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Forma de pago no encontrada",
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
  }
}

export async function PUT(request, { params }) {
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

    const [result] = await conexion.query("UPDATE payments SET ? WHERE id = ?", [
      updateData,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Forma de pago no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    const [updatedProduct] = await conexion.query(
      "SELECT * FROM payments WHERE id = ?",
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
  }
}
