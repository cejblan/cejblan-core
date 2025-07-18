"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Titulos from "@/components/editable/Titulos";
import { LoadOrders } from "../components/LoadOrders";

export default function OrdersPageAdmin() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const moment = require("moment");

  useEffect(() => {
    LoadOrders(setOrders);
  }, [setOrders]);

  // Calcular paginación
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

  if (orders.length === 0) {
    return (
      <h1 className="text-center text-xl md:text-2xl py-4 text-gray-600">Cargando pedidos...</h1>
    );
  }

  return (
    <>
      <Titulos texto="Pedidos" />

      {/* Grid de pedidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 px-2 pb-6">
        {currentOrders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="bg-white hover:bg-slate-100 border border-slate-200 rounded-xl p-4 shadow-sm transition-all duration-150"
          >
            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-700 text-center mb-2">
                #Pedido: {order.id}
              </h3>

              <div className="grid grid-cols-2 text-sm text-slate-700 gap-y-1">
                <p><span className="font-semibold">Nombre:</span> {order.name}</p>
                <p><span className="font-semibold">Teléfono:</span> {order.phoneNumber}</p>
                <p><span className="font-semibold">Monto:</span> {order.totalPrice}$</p>
                <p><span className="font-semibold">Pago:</span> {order.paymentMethod}</p>
                <p><span className="font-semibold">Entrega:</span> {order.deliveryMethod}</p>
                <p>
                  <span className="font-semibold">{order.deliveryMethodData?.length <= 2 ? "Costo:" : "Ubicación:"}</span>
                  {order.deliveryMethodData}
                </p>
                {order.deliveryMethod?.includes("Delivery") && order.deliveryDate && (
                  <p className="col-span-2">
                    <span className="font-semibold">Hora de Entrega:</span>{" "}
                    {moment(order.deliveryDate).format("DD/MM/YYYY HH:mm")}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-2 mt-2 grid grid-cols-2 text-sm text-center text-slate-600">
              <p>
                <span className="font-semibold">Estado:</span>{" "}
                <span className={`font-bold ${order.status === "COMPLETADO"
                  ? "text-green-600"
                  : order.status === "PROCESANDO"
                    ? "text-blue-600"
                    : "text-red-600"
                  }`}>{order.status}</span>
              </p>
              <p>
                <span className="font-semibold">Fecha:</span>{" "}
                <span className="font-medium">
                  {moment(order.date).subtract(4, "hours").format("DD/MM/YYYY")}
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div >

      {/* Controles de paginación */}
      < div className="flex justify-center items-center gap-4 mt-4" >
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition"
        >
          Anterior
        </button>
        <button
          onClick={handleNextPage}
          disabled={endIndex >= orders.length}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition"
        >
          Siguiente
        </button>
      </div >

      {/* Indicador de página */}
      < p className="text-center text-sm text-gray-500 mt-2 mb-6" >
        Página {currentPage} de {Math.ceil(orders.length / itemsPerPage)}
      </p >
    </>
  );
}