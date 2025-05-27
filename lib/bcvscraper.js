import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

export async function obtenerTasasBCV() {
  const URL = 'https://www.bcv.org.ve/'
  let tasas = { USD: null, EUR: null }

  try {
    const res = await fetch(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })
    const html = await res.text()
    const $ = cheerio.load(html)

    $('.view-tipo-cambio .field-content').each((i, el) => {
      const texto = $(el).text().trim()
      const valor = $(el).next().text().trim().replace(',', '.')
      if (texto.includes('USD')) tasas.USD = parseFloat(valor)
      if (texto.includes('EUR')) tasas.EUR = parseFloat(valor)
    })

    return tasas
  } catch (error) {
    console.error('Error al obtener tasas del BCV:', error.message)
    return null
  }
}
