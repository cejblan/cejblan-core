"use client"

import Link from "next/link";
import { useState } from "react";
import CartCard from "@/components/editable/CartCard";

export const forceDynamic = "force-dynamic";

export default function Cart() {
  const [hasProducts, setHasProducts] = useState(false); // Estado para saber si hay productos

  // Función que se le pasará a CartCard para actualizar el estado
  const handleProducts = (productCount) => {
    setHasProducts(productCount > 0);
  };

  return (
    // ===START_RETURN===
    <div>
      <div className="max-[420px]:px-1 px-4">
        <table className="table-auto bg-white text-slate-900 max-[420px]:text-xs text-lg tracking-tight rounded-xl shadow-6xl w-full">
          <thead>
            <tr className="bg-slate-300">
              <th className="border-r border-b border-slate-900 rounded-tl-xl">Nombre</th>
              <th className="border-r border-b border-slate-900">Cantidad</th>
              <th className="border-r border-b border-slate-900">Precio</th>
              {/* Se comento codigo innecesario
              <th className="border-r border-b border-slate-900">IVA</th>
              <th className="border-r border-b border-slate-900">Sub Total</th>
              */}
              <th className="border-r border-b border-slate-900">Total</th>
              <th className="bg-blue-500 text-white border-b border-slate-900 rounded-tr-xl">Acción</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderizar productos desde el componente cliente y pasar handleProducts */}
            <CartCard onProductCountChange={handleProducts} />
          </tbody>
        </table>
      </div>
      {/* Mostrar el botón de realizar pedido solo si hay productos */}
      {
        hasProducts && (
          <Link href="./checkout" className="bg-blue-600 hover:bg-blue-600 text-xl font-bold text-white py-1 px-2 rounded-xl shadow-6xl mt-2 mx-auto w-fit block">
            Realizar Pedido
          </Link>
        )
      }
    </div>
    // ===END_RETURN===
  )
}
