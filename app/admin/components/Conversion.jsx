'use client';
import { useEffect, useState } from 'react';

export function useConversion() {
  const [tasa, setTasa] = useState(null);
  const [monedaBase, setMonedaBase] = useState('USD');
  const [conversionActiva, setConversionActiva] = useState(false);

  useEffect(() => {
    async function cargarConfiguraciones() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();

        const activa = data.find(c => c.name === 'conversion_activa');
        const moneda = data.find(c => c.name === 'conversion_moneda');

        setConversionActiva(activa?.value === 'true');
        setMonedaBase(moneda?.value || 'USD');
      } catch (err) {
        console.error('Error cargando configuraciones de conversión', err);
      }
    }

    cargarConfiguraciones();
  }, []);

  useEffect(() => {
    async function cargarTasa() {
      try {
        const res = await fetch('/api/admin/coins');
        const data = await res.json();
        const seleccionada = data.tasas.find(t => t.moneda === monedaBase);
        if (seleccionada) setTasa(parseFloat(seleccionada.valor));
      } catch (err) {
        console.error('Error cargando tasa', err);
      }
    }

    if (monedaBase) {
      cargarTasa();
    }
  }, [monedaBase]);

  const convertir = (monto) => {
    if (!conversionActiva || !tasa) return monto;
    return monto * tasa;
  };

  return {
    tasa,
    convertir,
    conversionActiva,
    monedaBase,
  };
}