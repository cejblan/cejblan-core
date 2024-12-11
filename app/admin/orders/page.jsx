"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Titulos from "@/components/Titulos";
import { LoadOrders } from "../components/LoadOrders";

export default function OrdersPageAdmin() {
  const [orders, setOrders] = useState([]);
  const moment = require("moment");

  useEffect(() => {
    LoadOrders(setOrders);
  }, [setOrders]);

  if (orders.length === 0) {
    return (
      <h1 className="max-[420px]:text-base text-2xl text-center p-1 mx-auto">
        Cargando pedidos...
      </h1>
    );
  };

  return (
    <>
      <Titulos texto="Pedidos" />
      <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-1 justify-center items-center pb-4">
        {orders.map(order => (
          <Link
            key={order.id}
            className="bg-white hover:bg-slate-300 text-slate-800 text-lg max-[420px]:text-xs tracking-normal leading-5 shadow-6xl rounded-xl p-2 z-10"
            href={`/adriliciaus/admin/orders/${order.id}`}
          >
            <div className="text-justify">
              <h3 className="text-xlmax-[420px]:text-sm text-center font-bold mb-1">#Pedido: {order.id}</h3>
              <div className="grid grid-cols-2">
                <h3>
                  <span className="font-semibold">Nombre: </span>
                  {order.name}
                </h3>
                <h3>
                  <span className="font-semibold">Teléfono: </span>
                  {order.phoneNumber}
                </h3>
              </div>
              <div className="grid grid-cols-2">
                <h3>
                  <span className="font-semibold">Monto: </span>
                  {order.totalPrice}$
                </h3>
                <h3>
                  <span className="font-semibold">Pago: </span>
                  {order.paymentMethod}
                </h3>
              </div>
              <div className="grid grid-cols-2">
                <h3>
                  <span className="font-semibold">Entrega: </span>
                  {order.deliveryMethod}
                </h3>
                <h3>
                  <span className="font-semibold">Metodo: </span>
                  {order.deliveryMethodData}
                </h3>
              </div>
            </div>
            <div className="text-center mt-2 grid grid-cols-2 justify-center items-center">
              <h3>
                <span className="font-semibold">Estado: </span>
                <span className="text-blue-700 text-xlmax-[420px]:text-sm font-bold tracking-tighter">{order.status}</span>
              </h3>
              <h3 className="font-semibold">
                <span>Fecha: </span>
                <span className="text-xlmax-[420px]:text-sm font-bold">{moment(order.date).subtract(4, "hours").format("DD/MM/YYYY")}</span>
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}