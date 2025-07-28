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

      let [_, descripcion, cantidad, costo, inventario] = match;

      // Buscar código en líneas anteriores
      let codigo = null;
      for (let j = i - 1; j >= 0 && j >= i - 3; j--) {
        const codeMatch = lines[j].match(/^(\d{3,})\b/);
        if (codeMatch) {
          codigo = codeMatch[1];
          break;
        }
      }

      if (!codigo) {
        // Último recurso: intenta buscar un número al final de la descripción
        const codeFallback = descripcion.match(/(\d{3,})$/);
        if (codeFallback) {
          codigo = codeFallback[1];
          descripcion = descripcion.replace(codeFallback[0], '').trim();
        } else {
          continue; // No se encontró código, descartar
        }
      }

      // Normalizar
      const id = codigo.padStart(4, '0');
      const nombre = descripcion;
      const cantidadNorm = cantidad.replace(',', '.');
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
