"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import dynamic from "next/dynamic";
const Maps = dynamic(() => import("@/components/Maps"), { ssr: false });

export default function OrderForm() {
  const [order, setOrder] = useState({
    id: "",
    name: "",
    email: "",
    date: "",
    status: "",
    totalPrice: "",
    productsIds: "",
    productsQuantity: "",
    paymentMethod: "",
    image: "",
    phoneNumber: "",
    address: "",
    deliveryMethod: "",
    deliveryMethodData: "",
    latitude: "",
    longitude: "",
    delivery: "", // id del delivery asignado
  });

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState("");

  const router = useRouter();
  const params = useParams();
  const moment = require("moment");

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (params.id) {
          const res = await fetch(`/api/admin/orders/${params.id}`, { method: "GET" });
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          setOrder({ ...data });
          setSelectedDelivery(data.delivery || ""); // cargar delivery asignado
        }
      } catch (error) {
        console.error("Error al cargar el pedido:", error);
      }
    };

    const fetchDeliveries = async () => {
      try {
        // Cambiar endpoint para obtener usuarios con rol delivery
        const res = await fetch("/api/admin/users/delivery?role=delivery");
        if (!res.ok) throw new Error(`Error al cargar usuarios: ${res.statusText}`);
        const data = await res.json();
        setDeliveries(data);
      } catch (err) {
        console.error("Error al cargar usuarios delivery:", err);
      }
    };

    fetchOrder();
    fetchDeliveries();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", order.name);
    formData.append("email", order.email);
    formData.append("status", order.status);
    formData.append("address", order.address);
    formData.append("delivery", selectedDelivery); // Guardar id del delivery

    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al actualizar la orden");

      const dataOrder = await res.json();

      if (dataOrder.status === "COMPLETADO") {
        await fetch("/api/telegram/qualification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataOrder }),
        });
      } else if (dataOrder.status === "CANCELADO") {
        await fetch("/api/telegram/canceleOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataOrder }),
        });
      } else if (dataOrder.status === "PROCESANDO" && selectedDelivery) {
        // Obtener chatId del delivery seleccionado para enviar mensaje Telegram
        const deliveryUser = deliveries.find((d) => String(d.id) === String(selectedDelivery));
        if (deliveryUser?.chatId) {
          await fetch("/api/telegram/notifyDelivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chatId: deliveryUser.chatId,
              orderId: dataOrder.id,
              deliveryInfo: {
                deliveryMethod: dataOrder.deliveryMethod,
                address: dataOrder.address,
                deliveryMethodData: dataOrder.deliveryMethodData,
              },
              name: dataOrder.name,
              phoneNumber: dataOrder.phoneNumber,
              deliveryDate: dataOrder.deliveryDate,
            }),
          });
        }
      }

      alert("El pedido se actualizó correctamente.");
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
      alert("Ocurrió un error al actualizar el pedido. Inténtalo nuevamente.");
    }
  };

  if (!order.id) {
    return <h1 className="text-center text-2xl p-4">Cargando pedido...</h1>;
  }

  return (
    <>
      <Link
        href="/admin/orders"
        className="absolute top-2 left-2 bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md shadow-6xl"
      >
        <FaArrowLeft />
      </Link>

      <form onSubmit={handleSubmit} className="px-4 py-6 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Info Pedido */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Información del Pedido</h2>
            <p>
              <strong>#Pedido:</strong> {order.id}
            </p>
            <p>
              <strong>Fecha:</strong> {moment(order.date).subtract(4, "hours").format("DD/MM/YYYY")}
            </p>
            <p>
              <strong>Monto:</strong> {order.totalPrice}$
            </p>
            <label className="block font-semibold text-slate-600 mt-2">Estado:</label>
            <select
              name="status"
              value={order.status}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 ${order.status === "COMPLETADO"
                ? "text-green-600"
                : order.status === "PROCESANDO"
                  ? "text-blue-600"
                  : "text-red-600"
                }`}
            >
              <option value="COMPLETADO">COMPLETADO</option>
              <option value="PROCESANDO">PROCESANDO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Productos</h2>
            <p>
              <strong>IDs:</strong>{" "}
              {Array.isArray(order.productsIds) ? (
                order.productsIds.map((id, i) => (
                  <Link
                    key={i}
                    href={`/admin/products/${id}`}
                    className="text-blue-600 hover:underline mr-1"
                  >
                    {String(id).padStart(4, "0")}
                  </Link>
                ))
              ) : (
                <Link href={`/admin/products/${order.productsIds}`} className="text-blue-600 hover:underline">
                  {String(order.productsIds).padStart(4, "0")}
                </Link>
              )}
            </p>
            <p>
              <strong>Cantidad:</strong> {order.productsQuantity}
            </p>
            <p>
              <strong>Pago:</strong> {order.paymentMethod}
            </p>
            <p>
              <strong>Comprobante:</strong>
            </p>
            {order.image ? (
              <Link href={order.image} target="_blank" className="text-blue-500 hover:underline">
                Ver Imagen
              </Link>
            ) : (
              <span className="text-slate-400">Sin imagen</span>
            )}
          </div>

          {/* Cliente */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Cliente</h2>
            <p>
              <strong>Nombre:</strong> {order.name}
            </p>
            <p>
              <strong>Email:</strong> {order.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {order.phoneNumber}
            </p>
            <p>
              <strong>Dirección:</strong> {order.address}
            </p>
          </div>

          {/* Entrega */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Entrega</h2>
            <p>
              <strong>Método:</strong> {order.deliveryMethod}
            </p>
            <p>
              <strong>{order.deliveryMethodData?.length <= 2 ? "Costo:" : "Ubicación:"}</strong>
              {order.deliveryMethodData}
            </p>
            {/* ✅ Mostrar fecha y hora de entrega si existe */}
            {order.deliveryDate && (
              <p>
                <strong>Entrega programada:</strong>{" "}
                {moment(order.deliveryDate).format("dddd, D [de] MMMM [a las] h:mm A")}
              </p>
            )}
            {/* ✅ Mostrar mapa si hay coordenadas */}
            {order.latitude && order.longitude && (
              <div className="mt-2 rounded-md overflow-hidden border">
                <Maps latitude={order.latitude} longitude={order.longitude} />
              </div>
            )}
            {/* ✅ Mostrar select solo si es Delivery */}
            {order.deliveryMethod === "Delivery" && (
              <div className="mt-2">
                <label className="font-semibold text-slate-600 block mb-1">Asignar Repartidor:</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={selectedDelivery}
                  onChange={(e) => setSelectedDelivery(e.target.value)}
                >
                  <option value="">Seleccionar Delivery</option>
                  {deliveries.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md"
          >
            Actualizar Pedido
          </button>
        </div>
      </form>
    </>
  );
}