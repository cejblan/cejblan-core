import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

// === GET: obtener deliveryHours y workingHours ===
export async function GET() {
  try {
    const [deliveryRows] = await conexion.query(
      "SELECT value FROM settings WHERE name = 'delivery_hours' LIMIT 1"
    );
    const [workingRows] = await conexion.query(
      "SELECT value FROM settings WHERE name = 'working_hours' LIMIT 1"
    );

    const deliveryHours = deliveryRows?.[0]?.value || null;
    const workingHours = workingRows?.[0]?.value || null;

    return NextResponse.json({ deliveryHours, workingHours });
  } catch (error) {
    console.error("Error al obtener delivery settings:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// === PUT: actualizar delivery_hours o working_hours ===
export async function PUT(req) {
  try {
    const body = await req.json();
    const { deliveryHours, workingHours } = body;

    if (deliveryHours !== undefined) {
      await conexion.query(
        "UPDATE settings SET value = ? WHERE name = 'delivery_hours'",
        [deliveryHours]
      );
    }

    if (workingHours !== undefined) {
      await conexion.query(
        "UPDATE settings SET value = ? WHERE name = 'working_hours'",
        [workingHours]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar delivery settings:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
