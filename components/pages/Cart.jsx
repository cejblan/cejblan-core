"use client";

import Link from "next/link";
import { useState } from "react";
import CartCard from "@/components/editable/CartCard";

export const forceDynamic = "force-dynamic";

export default function Cart() {
  const [hasProducts, setHasProducts] = useState(false);

  const handleProducts = (productCount) => {
    setHasProducts(productCount > 0);
  };

  return (
    // ===START_RETURN===
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse rounded-xl overflow-hidden shadow-md">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 border border-slate-300">Nombre</th>
              <th className="px-4 py-3 border border-slate-300">Cantidad</th>
              <th className="px-4 py-3 border border-slate-300">Precio</th>
              <th className="px-4 py-3 border border-slate-300">Total</th>
              <th className="px-4 py-3 border border-slate-300 bg-[#6ed8bf] text-white">Acción</th>
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
            className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
          >
            Realizar Pedido
          </Link>
        </div>
      )}
    </div>
    // ===END_RETURN===
  );
}
