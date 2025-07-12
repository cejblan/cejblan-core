"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import moment from "moment";
import "moment/locale/es";
moment.locale("es");

export default function DeliveryCalendar() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // Modal

  useEffect(() => {
    if (status === "authenticated") {
      const fetchOrders = async () => {
        try {
          const resUser = await fetch(`/api/admin/users/by-email?email=${session.user.email}`);
          if (!resUser.ok) throw new Error("No se pudo obtener usuario");
          const user = await resUser.json();

          const resOrders = await fetch(`/api/admin/orders/by-delivery?id=${user.id}`);
          if (!resOrders.ok) throw new Error("No se pudieron obtener pedidos");
          const dataOrders = await resOrders.json();

          setOrders(dataOrders);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [session, status]);

  if (loading) return <p>Cargando pedidos...</p>;
  if (status === "unauthenticated") return <p>No autorizado</p>;
  if (orders.length === 0) return <p>No tienes pedidos asignados.</p>;

  const ordersByDay = orders.reduce((acc, order) => {
    const day = moment(order.DeliveryDate).format("YYYY-MM-DD");
    if (!acc[day]) acc[day] = [];
    acc[day].push(order);
    return acc;
  }, {});

  const lastDate = moment.max(orders.map((o) => moment(o.DeliveryDate)));
  const year = lastDate.year();
  const month = lastDate.month();

  const startOfMonth = moment([year, month]).startOf("month");
  const endOfMonth = moment([year, month]).endOf("month");
  const startDayOfWeek = startOfMonth.isoWeekday();
  const daysInMonth = endOfMonth.date();
  const today = moment().format("YYYY-MM-DD");

  const days = [];
  for (let i = 1; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = moment([year, month, d]);
    days.push(date);
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Calendario de Pedidos – {startOfMonth.format("MMMM YYYY")}
      </h1>

      <div className="grid grid-cols-7 gap-px bg-gray-300 text-center font-semibold text-gray-700">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="bg-white p-2 border font-bold">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-300">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={idx} className="h-28 bg-white border" />;
          }

          const dateKey = date.format("YYYY-MM-DD");
          const isToday = dateKey === today;
          const dayOrders = ordersByDay[dateKey] || [];

          return (
            <div
              key={dateKey}
              className={`h-28 bg-white border p-1 text-sm flex flex-col ${
                isToday ? "bg-yellow-100 border-yellow-400" : ""
              }`}
            >
              <div className="text-xs font-bold mb-1">{date.date()}</div>
              <div className="overflow-y-auto space-y-1">
                {dayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="text-blue-700 text-xs bg-blue-100 rounded px-1 py-0.5 cursor-pointer hover:bg-blue-200"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {moment(order.DeliveryDate).format("HH:mm")} – #{order.id}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-2">Pedido #{selectedOrder.id}</h2>
            <p><strong>Cliente:</strong> {selectedOrder.name}</p>
            <p><strong>Fecha:</strong> {moment(selectedOrder.DeliveryDate).format("dddd, D [de] MMMM HH:mm")}</p>
            <p><strong>Dirección:</strong> {selectedOrder.address}</p>
            <p><strong>Teléfono:</strong> {selectedOrder.phoneNumber}</p>
            {/* Agrega más campos si deseas */}
          </div>
        </div>
      )}
    </div>
  );
}
