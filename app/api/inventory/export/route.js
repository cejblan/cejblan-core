// app/api/inventario/export/route.js
import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { rows } = await req.json();

  // 1️⃣ Crear workbook y hoja
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Inventario');

  // 2️⃣ Título
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'Inventario de Productos';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 3️⃣ Salto de fila y encabezado
  sheet.addRow([]);
  const headerRow = sheet.addRow(['ID', 'Nombre', 'Cantidad', 'Precio', 'Precio Mayorista', 'Total']);
  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 4️⃣ Datos
  rows.forEach(r => {
    const row = sheet.addRow([r.id, r.nombre, r.cantidad, r.precio, r.precioMayorista, r.valorInventario]);
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // 5️⃣ Ajustar anchos
  sheet.columns = [
    { key: 'id', width: 12 },
    { key: 'nombre', width: 45 },
    { key: 'cantidad', width: 15 },
    { key: 'precio', width: 15 },
    { key: 'precioMayorista', width: 20 },
    { key: 'valorInventario', width: 18 } // nueva columna Total
  ];

  // 6️⃣ Generar buffer y respuesta
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="inventario_${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
