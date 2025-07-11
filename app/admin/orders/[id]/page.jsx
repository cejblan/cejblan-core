"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { PiCurrencyDollarSimpleFill } from "react-icons/pi";
import dynamic from "next/dynamic";
const Maps = dynamic(() => import("@/components/Maps"), { ssr: false });

export default function OrderForm() {
  const [order, setOrder] = useState({
    id: "",
    name: "",
    email: "",
    data: "",
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
  });
  const router = useRouter();
  const params = useParams();
  const moment = require("moment");
  const handleChange = (e) => {
    setOrder({
      ...order,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (params.id) {
          const res = await fetch(`/api/admin/orders/${params.id}`, {
            method: 'GET',
          });
          if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          setOrder({
            id: data.id,
            name: data.name,
            email: data.email,
            date: data.date,
            status: data.status,
            totalPrice: data.totalPrice,
            productsIds: data.productsIds,
            productsQuantity: data.productsQuantity,
            paymentMethod: data.paymentMethod,
            image: data.image,
            phoneNumber: data.phoneNumber,
            address: data.address,
            deliveryMethod: data.deliveryMethod,
            deliveryMethodData: data.deliveryMethodData,
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      } catch (error) {
        console.error("Error al cargar el pago:", error);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", order.name);
    formData.append("email", order.email);
    formData.append("status", order.status);
    formData.append("address", order.address);

    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al actualizar la orden");
      } else {
        const dataOrder = await res.json();

        if (dataOrder.status === "COMPLETADO") {
          const telegram = await fetch("/api/telegram/qualification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dataOrder }),
          });

          if (telegram.ok) {
            console.log("Solicitud de calificacion envianda al Telegram");
          } else {
            const errorData = await telegram.json();
            console.log(errorData.message);
          }
        } else if (dataOrder.status === "CANCELADO") {
          const telegram = await fetch("/api/telegram/canceleOrder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dataOrder }),
          });

          if (telegram.ok) {
            console.log("Mensaje de Cancelacion enviando al Telegram");
          } else {
            const errorData = await telegram.json();
            console.log(errorData.message);
          }
        }
      }

      alert("El pedido se actualizo correctamente.");
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
      alert("Ocurrió un error al actualizar el pedido. Por favor, inténtalo nuevamente.");
    }

    router.push("/admin/orders");
  };

  if (order.id.length === 0) {
    return (
      <h1 className="max-[420px]:text-base text-2xl text-center p-1 mx-auto">
        Cargando pedido...
      </h1>
    );
  };
  return (
    <>
      <Link href={`/admin/orders/`} className=" bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>

      <form onSubmit={handleSubmit} className="px-4 py-6 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">

          {/* Sección Pedido */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Información del Pedido</h2>
            <p><strong>#Pedido:</strong> {order.id}</p>
            <p><strong>Fecha:</strong> {moment(order.date).subtract(4, "hours").format("DD/MM/YYYY")}</p>
            <p><strong>Monto:</strong> {order.totalPrice}$</p>
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

          {/* Sección Productos */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Productos</h2>
            <p>
              <strong>IDs:</strong>{" "}
              {Array.isArray(order.productsIds)
                ? order.productsIds.map((id, i) => (
                  <Link key={i} href={`/admin/products/${id}`} className="text-blue-600 hover:underline mr-1">
                    {String(id).padStart(4, "0")}
                  </Link>
                ))
                : (
                  <Link href={`/admin/products/${order.productsIds}`} className="text-blue-600 hover:underline">
                    {String(order.productsIds).padStart(4, "0")}
                  </Link>
                )}
            </p>
            <p><strong>Cantidad:</strong> {order.productsQuantity}</p>
            <p><strong>Pago:</strong> {order.paymentMethod}</p>
            <p><strong>Comprobante:</strong></p>
            {order.image ? (
              <Link href={order.image} target="_blank" className="text-blue-500 hover:underline">Ver Imagen</Link>
            ) : (
              <span className="text-slate-400">Sin imagen</span>
            )}
          </div>

          {/* Sección Cliente */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Cliente</h2>
            <p><strong>Nombre:</strong> {order.name}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Teléfono:</strong> {order.phoneNumber}</p>
            <p><strong>Dirección:</strong> {order.address}</p>
          </div>

          {/* Sección Entrega */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
            <h2 className="font-bold text-slate-700 mb-2">Entrega</h2>
            <p><strong>Método:</strong> {order.deliveryMethod}</p>
            <p><strong>Ubicación:</strong> {order.deliveryMethodData}</p>
            {order.latitude && order.longitude && (
              <div className="mt-2 rounded-md overflow-hidden border">
                <Maps latitude={order.latitude} longitude={order.longitude} />
              </div>
            )}
          </div>
        </div>

        {/* Botón actualizar */}
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