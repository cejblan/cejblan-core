import { NextResponse } from 'next/server';
import { obtenerTasasBCV } from '@/lib/bcv';

export async function GET() {
  try {
    const tasas = await obtenerTasasBCV();
    return NextResponse.json({ tasas });
  } catch (err) {
    console.error('Error al obtener tasas del BCV:', err);
    return NextResponse.json({ error: 'No se pudo obtener la tasa del BCV' }, { status: 500 });
  }
}
