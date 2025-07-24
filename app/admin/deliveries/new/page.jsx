"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";

export default function DeliveryForm() {
  const [delivery, setDelivery] = useState({
    id: "",
    name: "",
    data: "",
    status: "",
  });
  const form = useRef(null);
  const router = useRouter();
  const params = useParams();
  const handleChange = (e) => {
    setDelivery({
      ...delivery,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        if (params.id) {
          const res = await fetch("/api/admin/deliveries/" + params.id);
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          setDelivery({
            id: data.id,
            name: data.name,
            data: data.data,
            status: data.status,
          });
        } else {
          const res = await fetch("/api/admin/deliveries");
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          const maxId = Math.max(...data.map((d) => d.id ?? 0), 0);
          const nextId = maxId + 1;
          setDelivery((prev) => ({ ...prev, id: nextId }));
        }
      } catch (error) {
        console.error("Error al obtener el delivery:", error);
      }
    };

    fetchDelivery();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", delivery.name);
    formData.append("data", delivery.data);
    formData.append("status", delivery.status);

    try {
      const res = await fetch(
        params.id ? `/api/admin/deliveries/${params.id}` : "/api/admin/deliveries",
        {
          method: params.id ? "PUT" : "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Error en la solicitud de entrega");
      }

      alert("La entrega se guardó correctamente.");
    } catch (error) {
      console.error("Error al guardar la entrega:", error);
      alert("Ocurrió un error al guardar la entrega. Por favor, inténtalo nuevamente.");
    }

    form.current.reset();
    router.push("/admin/deliveries");
    router.refresh(); // Solo actualiza los componentes del servidor
  };

  return (
    <>
      <Link href={params.id ? `/admin/deliveries/${params.id}` : "/admin/deliveries"} className=" bg-slate-600 text-white hover:text-[#6ed8bf] text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>
      <form onSubmit={handleSubmit} ref={form} className="md:pl-3">
        <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-2 justify-center mb-4">
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto ml-4 max-[420px]:w-full">
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Id:</h2>
              <h3 className="bg-white text-gray-400 py-1 px-2 rounded-md">{delivery.id || "####"}</h3>
            </div>
            <div className="mb-1">
              <label htmlFor="name" className="text-lg font-semibold pr-1 mb-1 block">
                Nombre:
              </label>
              <input
                name="name"
                id="name"
                type="text"
                placeholder="Nombre"
                onChange={handleChange}
                value={delivery.name}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                autoFocus
                required
              />
            </div>
            <div className="mb-1">
              <label htmlFor="data" className="text-lg font-semibold pr-1 mb-1 block">
                Datos:
              </label>
              <ul className="mb-1">
                <li>Si el metodo es Delivery, en "Datos" se coloca el costo sin simbolos monetarios, y si es en decimal, no se utiliza coma, se utiliza punto. Ejemplo 2$ = 2 y 2,5$ = 2.5</li>
                <li>Si el metodo es Retiro, en "Datos" se coloca la dirección a donde buscar el pedido</li>
                <li>La configuracion "Delivery Gratis" está en el modulo "Configurar"</li>
              </ul>
              <input
                name="data"
                id="data"
                type="text"
                placeholder="Datos"
                onChange={handleChange}
                value={delivery.data}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                required
              />
            </div>
            <div className="mb-1">
              <label htmlFor="status" className="text-lg font-semibold pr-1 mb-1 block">
                Condición:
              </label>
              <select
                name="status"
                id="status"
                onChange={handleChange}
                value={delivery.status}
                className="hover:bg-blue-200 max-[420px]:text-center py-1 px-2 rounded-md w-full"
                required
              >
                <option value="">Selecciona la condición</option>
                <option value="Activado">Activado</option>
                <option value="Desactivado">Desactivado</option>
              </select>
            </div>
          </div>
          <div className="max-[420px]:text-center text-left mx-auto">
            <label htmlFor="image" className="text-lg font-semibold pr-1 mb-1 block">
              Imagen:
            </label>
            <div className="grid grid-cols-1">
              <div className="relative">
                <MdDeliveryDining className="text-[18rem]" />
              </div>
            </div>
          </div>
        </div>
        <button className="text-white bg-[#6ed8bf] hover:bg-[#4bb199] font-bold py-1 px-2 rounded-xl shadow-6xl mx-auto w-fit">
          {params.id ? "Actualizar forma de entrega" : "Crear forma de entrega"}
        </button>
      </form>
    </>
  );
}