"use client";

import Link from "next/link";
import { LoadProductsCart } from "./LoadProductsCart";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CalculateTotalPrice, GroupedProducts } from "./GroupedProducts";

export default function CartCard({ onProductCountChange }) {
  const { data: session } = useSession(); // Obtener la sesión actual del usuario
  const [products, setProducts] = useState([]); // Estado para almacenar los productos del carrito
  const sessionUser = session?.user?.email;

  // Cargar los productos cuando la sesión esté disponible
  useEffect(() => {
    if (session?.user?.email) {
      LoadProductsCart(sessionUser, setProducts);
    }
  }, [session, sessionUser]);

  // Notificar al componente padre la cantidad de productos
  useEffect(() => {
    onProductCountChange(products.length); // Notificar cuántos productos hay
  }, [products, onProductCountChange]);

  // Función para eliminar un producto específico
  const deleteProduct = async (id) => {
    try {
      const productsIds = id.split(",");
      if (confirm("¿Seguro quieres eliminar este producto del carrito?")) {
        const response = await fetch('/api/cart/deleteProduct', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productsIds }),
        });
        if (response.ok) {
          // Actualizar la lista de productos eliminando el producto borrado
          setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
          alert("Producto eliminado con éxito");
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Error al eliminar el producto");
        }
      }
    } catch (error) {
      console.error("Error eliminando el producto:", error);
      alert("Error al intentar eliminar el producto");
    }
  };

  // Agrupar productos por ID y calcular cantidad y subtotal
  const groupedProducts = GroupedProducts(products);

  // Calcular el total de los productos usando el array agrupado
  const totalPrice = CalculateTotalPrice(groupedProducts);

  if (groupedProducts.length === 0) {
    return (
      <tr className="max-[420px]:text-base text-2xl p-1">
        <td>El carrito está vacío</td>
      </tr>
    );
  };

  return (
    <>
      {groupedProducts.map((product) => {
        let priceIVA;
        let subtotal;
        /* Se comento codigo innecesario
        // Cálculos de IVA y subtotal
        if (product.iva === 16) {
          priceIVA = ((product.subtotal / 1.16) * 0.16).toFixed(2);
        } else if (product.iva === 8) {
          priceIVA = ((product.subtotal / 1.08) * 0.08).toFixed(2);
        } else if (product.iva === 0) {
          priceIVA = "E";
          subtotal = product.subtotal;
        }

        // Calcular subtotal después de IVA (solo si no es exento)
        if (priceIVA !== "E") {
          subtotal = (product.subtotal - parseFloat(priceIVA)).toFixed(2);
        }
        */
        return (
          <tr key={product.id}>
            <td className="border-r border-b border-slate-900 text-blue-700 hover:text-blue-900 underline">
              <Link href={`/adriliciaus/products/${product.id}`}>{product.name}</Link>
            </td>
            <td className="border-r border-b border-slate-900">{product.quantity}</td>
            <td className="border-r border-b border-slate-900">{product.price}$</td>
            {/* Se comento codigo innecesario
            <td className="border-r border-b border-slate-900">{priceIVA !== "E" ? `${priceIVA}$` : priceIVA}</td>
            <td className="border-r border-b border-slate-900">{subtotal}$</td>
            */}
            <td className="border-r border-b border-slate-900">{(product.quantity * product.price).toFixed(2)}$</td>
            <td className="py-1 border-b border-slate-900">
              {/* Botón para eliminar un producto específico */}
              <button
                onClick={() => deleteProduct(product.id)}
                className="bg-red-600 hover:bg-red-500 text-white py-1 max-[420px]:px-1 px-2 rounded-md"
              >
                Eliminar
              </button>
            </td>
          </tr>
        );
      })}
      <tr>
        <td></td>
        <td></td>
        {/* Se comento codigo innecesario
        <td></td>
        <td></td>
        */}
        <th className="bg-slate-300 border-x border-slate-900">Total</th>
        <th className="bg-slate-300 border-r max-[420px]:text-sm text-xl border-slate-900">{totalPrice}$</th>
      </tr>
    </>
  );
}
