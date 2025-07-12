"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // asumiendo next-auth, cambia si usas otro
import Link from "next/link";
import moment from "moment";

export default function DeliveryCalendar() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extrae email del token y busca pedidos asignados
  useEffect(() => {
    if (status === "authenticated") {
      const fetchOrders = async () => {
        try {
          // 1. Obtener ID del usuario delivery con su email
          const resUser = await fetch(`/api/admin/users/by-email?email=${session.user.email}`);
          if (!resUser.ok) throw new Error("No se pudo obtener usuario");
          const user = await resUser.json();

          // 2. Obtener pedidos asignados a ese delivery (por ID)
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

  // Organizar pedidos por fecha para mostrar en calendario simple (día)
  const ordersByDay = orders.reduce((acc, order) => {
    const day = moment(order.DeliveryDate).format("YYYY-MM-DD");
    if (!acc[day]) acc[day] = [];
    acc[day].push(order);
    return acc;
  }, {});

  // Obtener lista de fechas para mostrar calendario
  const days = Object.keys(ordersByDay).sort();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos asignados</h1>

      {days.length === 0 && <p>No tienes pedidos asignados.</p>}

      {days.map((day) => (
        <div key={day} className="mb-6 border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">{moment(day).format("dddd, DD [de] MMMM YYYY")}</h2>
          <div>
            {ordersByDay[day].map((order) => (
              <div key={order.id} className="mb-1">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {moment(order.DeliveryDate).format("HH:mm")} - Pedido #{order.id} - {order.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
