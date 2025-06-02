import * as cheerio from 'cheerio';

export async function obtenerTasasBCV() {
  const res = await fetch('https://www.bcv.org.ve/', {
    headers: {
      'User-Agent': 'Mozilla/5.0', // importante para que no bloqueen el request
    },
  });

  const html = await res.text();
  const $ = cheerio.load(html);
  const tasas = { USD: null, EUR: null };

  $('.view-tipo-cambio .field-content').each((i, el) => {
    const label = $(el).text().trim();
    const valor = $(el).next().text().trim().replace(',', '.');
    if (label.includes('USD')) tasas.USD = parseFloat(valor);
    if (label.includes('EUR')) tasas.EUR = parseFloat(valor);
  });

  return tasas;
}
