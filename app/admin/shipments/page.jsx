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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf("month"));

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
    const day = moment(order.deliveryDate).format("YYYY-MM-DD");
    if (!acc[day]) acc[day] = [];
    acc[day].push(order);
    return acc;
  }, {});

  const today = moment().format("YYYY-MM-DD");

  const startOfMonth = currentMonth.clone().startOf("month");
  const endOfMonth = currentMonth.clone().endOf("month");
  const startDayOfWeek = startOfMonth.isoWeekday(); // 1 (lunes) - 7 (domingo)
  const daysInMonth = endOfMonth.date();

  const days = [];

  // Agregar días del mes anterior (inicio de semana)
  const prevMonth = currentMonth.clone().subtract(1, "month");
  const prevMonthEnd = prevMonth.clone().endOf("month");

  for (let i = startDayOfWeek - 1; i > 0; i--) {
    const date = prevMonthEnd.clone().subtract(i - 1, "day");
    days.push({ date, isCurrentMonth: false });
  }

  // Agregar días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const date = currentMonth.clone().date(d);
    days.push({ date, isCurrentMonth: true });
  }

  // Agregar días del mes siguiente para completar la última fila
  const totalCells = Math.ceil(days.length / 7) * 7;
  const nextMonth = currentMonth.clone().add(1, "month");

  for (let i = 1; days.length < totalCells; i++) {
    const date = nextMonth.clone().date(i);
    days.push({ date, isCurrentMonth: false });
  }

  const goToPrevMonth = () => setCurrentMonth(prev => prev.clone().subtract(1, "month"));
  const goToNextMonth = () => setCurrentMonth(prev => prev.clone().add(1, "month"));

  return (
    <div className="max-w-6xl mx-auto p-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 text-center sm:text-left">
        <button
          onClick={goToPrevMonth}
          className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
        >
          ← Mes anterior
        </button>
        <h1 className="text-xl sm:text-2xl font-bold capitalize">
          {startOfMonth.format("MMMM YYYY")}
        </h1>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
        >
          Mes siguiente →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-300 text-center font-semibold text-gray-700 border border-slate-400 text-xs sm:text-sm">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="bg-white p-1 sm:p-2 border border-slate-400 font-bold">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-300 border border-slate-400 text-xs sm:text-sm">
        {days.map(({ date, isCurrentMonth }, idx) => {
          const dateKey = date.format("YYYY-MM-DD");
          const isToday = dateKey === today;
          const dayOrders = isCurrentMonth ? (ordersByDay[dateKey] || []) : [];

          return (
            <div
              key={dateKey + idx}
              className={`min-h-[80px] sm:h-28 border border-slate-400 p-1 flex flex-col overflow-hidden
                ${isCurrentMonth ? "bg-white" : "bg-gray-200 text-gray-500"}
                ${isToday ? "bg-yellow-100 border-yellow-400" : ""}`}
            >
              <div className="text-[10px] sm:text-xs font-bold mb-1">{date.date()}</div>
              <div className="overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-400">
                {dayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="text-blue-700 text-[10px] sm:text-xs bg-blue-100 rounded px-1 py-0.5 cursor-pointer hover:bg-blue-200"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {moment(order.deliveryDate).format("HH:mm")} – #{order.id}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-2">Pedido #{selectedOrder.id}</h2>
            <p><strong>Cliente:</strong> {selectedOrder.name}</p>
            <p><strong>Fecha:</strong> {moment(selectedOrder.deliveryDate).format("dddd, D [de] MMMM HH:mm")}</p>
            <p><strong>Dirección:</strong> {selectedOrder.address}</p>
            <p><strong>Teléfono:</strong> {selectedOrder.phoneNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
}
