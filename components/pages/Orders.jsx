"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import OrderCard from "@/components/editable/OrderCard";

export default function OrdersComponent() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const reversedOrders = [...orders].reverse();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = reversedOrders.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (endIndex < orders.length) setCurrentPage((prev) => prev + 1);
  };

  const loadBuys = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders?customerEmail=${encodeURIComponent(session.user.email)}`);
      const orders = await response.json();

      if (response.ok) {
        setOrders(orders);
      } else {
        console.error("Error:", orders.error);
      }
    } catch (error) {
      console.error("Error al cargar los pedidos:", error);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      loadBuys();
    }
  }, [session, loadBuys]);

  // ===START_RETURN===
  return (
    <section className="px-2 py-4">
      <div className="grid gap-2">
        {currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <OrderCard order={order} key={order.id} />
          ))
        ) : (
          <p className="text-center text-gray-600 text-lg font-medium py-6">
            Actualmente no tienes pedidos...
          </p>
        )}
      </div>

      {/* Paginación */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={handleNextPage}
          disabled={endIndex >= orders.length}
          className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <p className="text-center font-bold pb-2 mt-1">
        Página {currentPage} de {Math.ceil(orders.length / itemsPerPage)}
      </p>
    </section>
  );
  // ===END_RETURN===
}
