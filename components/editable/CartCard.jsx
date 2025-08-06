"use client";

import Link from "next/link";
import { LoadProductsCart } from "@/components/LoadProductsCart";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CalculateTotalPrice, GroupedProducts } from "@/components/GroupedProducts";
import PrecioProducto from "@/components/editable/PrecioProducto";

export default function CartCard({ onProductCountChange }) {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const sessionUser = session?.user?.email;

  useEffect(() => {
    if (session?.user?.email) {
      LoadProductsCart(sessionUser, setProducts);
    }
  }, [session, sessionUser]);

  useEffect(() => {
    onProductCountChange(products.length);
  }, [products, onProductCountChange]);

  const deleteProduct = async (id) => {
    try {
      const productsIds = [Number(id)];
      if (confirm("¿Seguro quieres eliminar este producto del carrito?")) {
        const response = await fetch("/api/cart/deleteProduct", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productsIds }),
        });
        if (response.ok) {
          setProducts((prev) => prev.filter((p) => p.id !== id));
          alert("Producto eliminado con éxito");
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Error al eliminar el producto");
        }
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al intentar eliminar el producto");
    }
  };

  const groupedProducts = GroupedProducts(products);
  const totalPrice = CalculateTotalPrice(groupedProducts);

  if (groupedProducts.length === 0) {
    return (
      <tr>
        <td className="px-4 py-3 text-slate-500 italic" colSpan={5}>
          El carrito está vacío
        </td>
      </tr>
    );
  }

  return (
    // ===START_RETURN===
    <>
      {groupedProducts.map((product) => (
        <tr key={product.id} className="hover:bg-slate-50 transition">
          <td className="px-4 py-3 border border-slate-200 text-[#4bb199] hover:text-[#2e806c] underline">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </td>
          <td className="px-4 py-3 border border-slate-200">{product.quantity}</td>
          <td className="px-4 py-3 border border-slate-200">
            <PrecioProducto precio={product.price} format={0} />
          </td>
          <td className="px-4 py-3 border border-slate-200">
            <PrecioProducto precio={(product.quantity * product.price).toFixed(2)} format={0} />
          </td>
          <td className="px-4 py-3 border border-slate-200">
            <button
              onClick={() => deleteProduct(product.id)}
              className="bg-red-500 hover:bg-red-400 text-white py-1 px-3 rounded-md text-sm font-medium shadow-sm"
            >
              Eliminar
            </button>
          </td>
        </tr>
      ))}

      <tr>
        <td></td>
        <td></td>
        <th className="px-4 py-3 border border-slate-300 bg-slate-100 text-right">Total</th>
        <th className="px-4 py-3 border border-slate-300 bg-slate-100">
          <PrecioProducto precio={totalPrice} format={0} />
        </th>
        <td></td>
      </tr>
    </>
    // ===END_RETURN===
  );
}
