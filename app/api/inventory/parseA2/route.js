import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse/lib/pdf-parse';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const { text } = await pdfParse(buffer);

    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const rows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // RegEx actualizada: permitir signo negativo en los grupos numéricos
      const match = line.match(/^(.*?)\s{2,}(-?[\d.,]+)\s{2,}(-?[\d.,]+)\s{2,}(-?[\d.,]+)/);
      if (!match) continue;

      let [_, codigo, descripcion, existencia, costo] = match;

      // Manejar posible signo negativo en 'existencia'
      const existenciaTrim = existencia.trim();
      const existenciaSign = existenciaTrim.startsWith('-') ? '-' : '';
      const existenciaAbs = existenciaSign ? existenciaTrim.slice(1) : existenciaTrim;

      // Extraer valorInventario y código desde existencia (usando la parte absoluta, luego reaplicar signo)
      const parts = existenciaAbs.split('.');
      const integerPart = parts[0] || '0';
      const decimalPart = parts[1] || '00000';

      const id = decimalPart.slice(-5);
      const valorInventario = existenciaSign + integerPart + '.' + decimalPart.slice(0, Math.max(0, decimalPart.length - 5));

      const nombre = codigo;
      const cantidadNorm = descripcion.replace(',', '.'); // conserva '-' si existe
      const precioNorm = costo.replace(',', '.'); // conserva '-' si existe

      rows.push({
        id,
        nombre,
        cantidad: cantidadNorm,
        precio: precioNorm,
        valorInventario
      });
    }

    return NextResponse.json({ rows });

  } catch (err) {
    console.error('Error al procesar PDF A2:', err.message, err.stack);
    return NextResponse.json({ error: 'No se pudo procesar el archivo PDF' }, { status: 500 });
  }
}
