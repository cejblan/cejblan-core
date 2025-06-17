'use client';
import { useConversion } from '@/app/admin/components/Conversion';

export default function PrecioProducto({ precio, format }) {
  const { convertir, conversionActiva, tasa } = useConversion();

  const precioBs = convertir(precio);

  return (
    <>{
      format === 1 ?
        <h4 className="text-3xl text-purple-700 font-bold my-2">
          ${precio.toFixed(2)}
          {conversionActiva && tasa && (
            <>
              <p className="bg-slate-300 text-slate-600 text-lg px-1 rounded-xl m-auto w-fit">
                al cambio BCV
              </p>
              <p className='text-xl'>
                {precioBs.toFixed(2)} bs
              </p>
            </>
          )}
        </h4>
        :
        conversionActiva && tasa ? (
          precioBs.toFixed(2) + "bs"
        ) : (
          "$" + precio.toFixed(2)
        )
    }
    </>
  );
}
