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
      <form onSubmit={handleSubmit}>
        <div className="grid max-[420px]:block grid-cols-12 gap-2 justify-center max-[420px]:pb-4 mb-4 ml-4 max-[420px]:ml-0">
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto col-start-1 col-end-3">
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">#Pedido:</h2>
              <h3 className="bg-white text-gray-400 py-1 px-2 rounded-md">{order.id}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Fecha:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{moment(order.date).subtract(4, "hours").format("DD/MM/YYYY")}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Monto:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.totalPrice}$</h3>
            </div>
            <div className="font-semibold mb-1">
              <label htmlFor="status" className="text-lg pr-1 mb-1 w-full block">Estado:</label>
              <select
                id="status"
                name="status"
                value={order.status}
                onChange={handleChange}
                className="bg-white text-blue-500 py-1 px-2 rounded-md"
                required
              >
                <option value="COMPLETADO">COMPLETADO</option>
                <option value="PROCESANDO">PROCESANDO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
          </div>
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto col-start-3 col-end-5">
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Productos:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md block">{order.productsIds}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Cantidad:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.productsQuantity}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Pago:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.paymentMethod}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Imagen:</h2>
              <Link href={order.image || "/"} className="bg-white text-blue-500 hover:text-blue-600 underline py-1 px-2 rounded-md block">Imagen</Link>
            </div>
          </div>
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto col-start-5 col-end-9">
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Nombre:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.name}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Correo:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.email}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Teléfono:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.phoneNumber}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Dirección:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.address}</h3>
            </div>
          </div>
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto col-start-9 col-end-13">
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Entrega:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.deliveryMethod}</h3>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Lugar de Entrega:</h2>
              <h3 className="bg-white py-1 px-2 rounded-md">{order.deliveryMethodData}</h3>
            </div>
            <div className="mx-auto h-[37%] max-[420px]:h-40 w-64 max-[420px]:w-full">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Ubicación:</h2>
              {order.latitude && order.longitude && (
                <Maps latitude={order.latitude} longitude={order.longitude} />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-x-2 justify-center">
          <button
            className="text-white bg-blue-500 hover:bg-blue-600 font-bold py-1 px-2 rounded-xl shadow-6xl"
          >
            Actualizar
          </button>
        </div>
      </form>
    </>
  );
}