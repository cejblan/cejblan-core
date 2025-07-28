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

      // Buscar líneas con estructura numérica similar a: código, cantidad, costo
      const match = line.match(/^(.*?)\s{2,}(-?\d+)\s{2,}([\d.,]+)\s{2,}([\d.,]+)/);
      if (!match) continue;

      let [index, codigo, descripcion, existencia, costo] = match;

      // Normalizar
      const id = (parseInt(existencia.split('.')[1] || existencia, 10).toString()).padStart(4, '0');
      const nombre = codigo;
      const cantidadNorm = descripcion.replace(',', '.');
      const precioNorm = costo.replace(',', '.');

      rows.push({
        id,
        nombre,
        cantidad: cantidadNorm,
        precio: precioNorm
      });
    }

    return NextResponse.json({ rows });

  } catch (err) {
    console.error('Error al procesar PDF A2:', err);
    return NextResponse.json({ error: 'No se pudo procesar el archivo PDF' }, { status: 500 });
  }
}
