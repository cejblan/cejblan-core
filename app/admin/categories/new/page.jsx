"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

export default function CategoryForm() {
  const [category, setCategory] = useState({
    id: "",
    name: "",
    data: "",
    status: "",
  });
  const form = useRef(null);
  const router = useRouter();
  const params = useParams();
  const handleChange = (e) => {
    setCategory({
      ...category,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (params.id) {
          const res = await fetch("/api/admin/categories/" + params.id);
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          setCategory({
            id: data.id,
            name: data.name,
            data: data.data,
            status: data.status,
          });
        } else {
          const res = await fetch("/api/admin/categories");
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          const maxId = Math.max(...data.map((c) => c.id ?? 0), 0);
          const nextId = maxId + 1;
          setCategory((prev) => ({ ...prev, id: nextId }));
        }
      } catch (error) {
        console.error("Error al obtener la categoría:", error);
      }
    };

    fetchCategory();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", category.name);
    formData.append("data", category.data);
    formData.append("status", category.status);

    const url = params.id ? `/api/admin/categories/${params.id}` : "/api/admin/categories";
    const method = params.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData, // FormData se pasa directamente
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log(
        params.id ? "Categoría actualizada:" : "Categoría creada:",
        data
      );
    } catch (error) {
      console.error(
        params.id ? "Error al actualizar la categoría:" : "Error al crear la categoría:",
        error
      );
    }

    alert("Categoría registrada");
    form.current.reset();
    router.push("/admin/categories");
    router.refresh(); // Solo actualiza los componentes del servidor
  };

  return (
    <>
      <Link href={params.id ? `/admin/categories/${params.id}` : "/admin/categories"} className=" bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>
      <form onSubmit={handleSubmit} ref={form} className="md:pl-3">
        <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-2 justify-center mb-4">
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto ml-4 max-[420px]:w-full">
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Id:</h2>
              <h3 className="bg-white text-gray-400 py-1 px-2 rounded-md">{category.id || "####"}</h3>
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
                value={category.name}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                autoFocus
                required
              />
            </div>
            <div className="mb-1">
              <label htmlFor="data" className="text-lg font-semibold pr-1 mb-1 block">
                Descripción:
              </label>
              <input
                name="data"
                id="data"
                type="text"
                placeholder="Descripción"
                onChange={handleChange}
                value={category.data}
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
                value={category.status}
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
                <MdCategory className="text-[18rem]" />
              </div>
            </div>
          </div>
        </div>
        <button className="text-white bg-blue-500 hover:bg-blue-600 font-bold py-1 px-2 rounded-xl shadow-6xl mx-auto w-fit">
          {params.id ? "Actualizar cateoría" : "Crear cateoría"}
        </button>
      </form>
    </>
  );
}