'use client';
import { useSession } from 'next-auth/react';

export function useConversion() {
  const { data: session } = useSession();

  const conversionActiva = session?.user?.conversion_activa ?? false;
  const monedaBase = session?.user?.conversion_moneda ?? 'USD';
  const tasa = parseFloat(session?.user?.tasa_conversion ?? '0');

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
