import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";

// === OBTENER CONFIGURACIONES ===
export async function GET() {
  try {
    const [deliveryHoursResult] = await conexion.query(
      "SELECT value FROM settings WHERE name = 'delivery_hours' LIMIT 1"
    );
    const [workingHoursResult] = await conexion.query(
      "SELECT value FROM settings WHERE name = 'working_hours' LIMIT 1"
    );

    const deliveryHours = deliveryHoursResult?.value || "";
    const workingHours = workingHoursResult?.value || "";

    return NextResponse.json({
      deliveryHours,
      workingHours,
    });
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// === ACTUALIZAR CONFIGURACIONES ===
export async function PUT(req) {
  try {
    const { deliveryHours, workingHours } = await req.json();

    if (typeof deliveryHours !== "string" || typeof workingHours !== "string") {
      return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }

    await conexion.query(
      "UPDATE settings SET value = ? WHERE name = 'delivery_hours'",
      [deliveryHours]
    );

    await conexion.query(
      "UPDATE settings SET value = ? WHERE name = 'working_hours'",
      [workingHours]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar horarios:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}