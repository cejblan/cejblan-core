'use client';
import { useConversion } from '@/app/admin/components/Conversion';

export default function PrecioProducto({ precio }) {
  const { convertir, conversionActiva, tasa, monedaBase } = useConversion();

  const precioBs = convertir(precio);

  return (
    <>
      <h4 className="text-4xl text-purple-700 font-bold my-2">
        ${precio.toFixed(2)}
        {conversionActiva && tasa && (
          <>
            <p className="bg-slate-300 text-slate-600 max-[420px]:text-xl md:text-2xl px-1 rounded-xl my-1 mx-auto w-fit">
              al cambio BCV
            </p><p>
              {precioBs.toFixed(2)} bs
            </p>
          </>
        )}
      </h4>
    </>
  );
}
