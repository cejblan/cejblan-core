import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse/lib/pdf-parse';  // import explícito

export async function POST(req) {
  // esperamos multipart/form-data
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) {
    return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // parseamos
  const { text } = await pdfParse(buffer);

  // dividimos en líneas y buscamos encabezado
  const lines = text.split('\n');
  const start = lines.findIndex(l =>
    l.includes('Código') && l.includes('Descripción') && l.includes('Existencia')
  );
  if (start < 0) {
    return NextResponse.json({ error: 'Formato A2 no reconocido' }, { status: 400 });
  }

  const rows = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // asume que campos van separados por 2+ espacios
    const parts = line.split(/\s{2,}/);
    if (parts.length < 4) continue;
    let [codigo, descripcion, existencia, costo] = parts;
    // limpieza mínima
    codigo = codigo.replace(/\D/g, '');
    existencia = existencia.replace(',', '.');
    costo      = costo.replace(',', '.');
    // formateo ID a 4 dígitos
    const id = codigo.padStart(4, '0');
    rows.push({ id, nombre: descripcion, cantidad: existencia, precio: costo });
  }

  return NextResponse.json({ rows });
}
