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

      // --- BLOQUE REEMPLAZADO: detectar y normalizar ambos formatos
      const existenciaTrim = existencia.trim();
      const existenciaSign = existenciaTrim.startsWith('-') ? '-' : '';
      let existenciaAbs = existenciaSign ? existenciaTrim.slice(1) : existenciaTrim;

      // Si contiene coma -> asumimos formato "puntos = miles" y "coma = decimal" (ej: 3.236,5000000001)
      // Si NO contiene coma -> asumimos formato "punto = decimal" (ej: 56.0000001)
      if (existenciaAbs.includes(',')) {
        // quitar puntos de miles y convertir coma decimal a punto
        existenciaAbs = existenciaAbs.replace(/\./g, '').replace(',', '.');
      } else {
        // quitar comas si existieran por si acaso; mantener punto como separador decimal
        existenciaAbs = existenciaAbs.replace(/,/g, '');
      }

      // Ahora separar parte entera y decimal (con '.' como separador)
      const parts = existenciaAbs.split('.');
      const integerPartRaw = parts[0] || '0';
      const decimalPartRaw = (parts[1] || '').replace(/\D/g, ''); // sólo dígitos

      // CORRECCIÓN: rellenar a la izquierda para mantener el valor numérico correcto (ej '1' -> '00000001')
      const decimalPaddedLeft = decimalPartRaw.padStart(8, '0');
      const id = decimalPartRaw.length >= 8 ? decimalPartRaw.slice(-8) : decimalPaddedLeft;

      // Parte decimal que queda a la izquierda del id (para construir valorInventario)
      const valorDecimalLeft = decimalPartRaw.length > 8 ? decimalPartRaw.slice(0, decimalPartRaw.length - 8) : '';

      // Limpiar la parte entera por si hay caracteres inesperados
      const integerPart = (integerPartRaw || '0').replace(/\D/g, '') || '0';

      // Construir valorInventario: sólo agregar el punto si hay parte decimal izquierda
      const valorInventario = existenciaSign + integerPart + (valorDecimalLeft ? '.' + valorDecimalLeft : '');
      // --- FIN BLOQUE REEMPLAZADO

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
