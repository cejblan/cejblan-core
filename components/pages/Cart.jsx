"use client";

import Link from "next/link";
import { useState } from "react";
import CartCard from "@/components/editable/CartCard";
import branding from "@/config/themes.json";

export const forceDynamic = "force-dynamic";

export default function Cart() {
  const { palette } = branding;
  const [hasProducts, setHasProducts] = useState(false);

  const handleProducts = (productCount) => {
    setHasProducts(productCount > 0);
  };

  return (
    // ===START_RETURN===
    <section className="px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse rounded-xl overflow-hidden shadow-md">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 border border-slate-300">Nombre</th>
              <th className="px-4 py-3 border border-slate-300">Cantidad</th>
              <th className="px-4 py-3 border border-slate-300">Precio</th>
              <th className="px-4 py-3 border border-slate-300">Total</th>
              <th
                className="px-4 py-3 border border-slate-300 text-white"
                style={{ backgroundColor: palette[1] }} // palette[1] reemplaza #6ed8bf
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white text-slate-900 divide-y divide-slate-200">
            <CartCard onProductCountChange={handleProducts} />
          </tbody>
        </table>
      </div>

      {hasProducts && (
        <div className="mt-6 flex justify-end">
          <Link
            href="./checkout"
            className="text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
            style={{ backgroundColor: palette[1] }} // palette[1] reemplaza #6ed8bf
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = palette[2]; }} // hover -> palette[2] reemplaza #4bb199
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = palette[1]; }}
          >
            Realizar Pedido
          </Link>
        </div>
      )}
    </section>
    // ===END_RETURN===
  );
}
