"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import OrderCard from "@/components/editable/OrderCard";

export default function OrdersComponent() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Se invierte el arreglo antes de paginar
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
      const response = await fetch(`/api/orders?customerEmail=${encodeURIComponent(session.user.email)}`, {
        method: "GET",
      });

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

  return (
    // ===START_RETURN===
    <div>
      <div className="max-[420px]:p-2 p-4">
        <div className="bg-white p-2 rounded-xl grid grid-cols-1 gap-2">
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <OrderCard order={order} key={order.id} />
            ))
          ) : (
            <div className="col-start-1 max-[420px]:col-end-2 col-end-4 max-w-fit m-auto">
              <p className="bg-white text-xl py-1 px-2 rounded-xl mx-auto">
                Actualmente no tienes pedidos...
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Controles de paginación */}
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
      {/* Indicador de página */}
      <p className="text-center text-white font-bold drop-shadow-6xl py-1">
        Página {currentPage} de {Math.ceil(orders.length / itemsPerPage)}
      </p>
    </div>
    // ===END_RETURN===
  );
}