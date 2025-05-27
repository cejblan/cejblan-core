import { obtenerTasasBCV } from '@/lib/bcvscraper'

export async function GET() {
  const tasas = await obtenerTasasBCV()

  if (tasas) {
    return Response.json({ tasas })
  } else {
    return Response.json({ error: 'No se pudieron obtener las tasas' }, { status: 500 })
  }
}
