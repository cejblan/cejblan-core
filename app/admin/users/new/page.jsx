"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import ImageNotSupported from "@/public/ImageNotSupported.webp";
import GaleriaModal from "@/app/admin/components/GaleriaModal";

export default function UserForm() {
  const [bloqueado, setBloqueado] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [galeriaAbierta, setGaleriaAbierta] = useState(false);

  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    rol: "",
    image: "",
  });

  const form = useRef(null);
  const router = useRouter();
  const params = useParams();

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (params.id) {
          const res = await fetch(`/api/admin/users/${params.id}`);
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            rol: data.rol,
            image: data.image,
          });
          if (["0001", "1", 1].includes(data.id)) {
            setBloqueado(true);
            setShowModal(true);
          }
        } else {
          const res = await fetch("/api/admin/users");
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          const maxId = Math.max(...data.map((u) => u.id ?? 0), 0);
          const nextId = maxId + 1;
          setUser((prev) => ({ ...prev, id: nextId }));
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleSubmit = async (e) => {
    if (bloqueado) {
      alert("Este usuario no puede ser editado. Contacte a un desarrollador.");
      return;
    }

    e.preventDefault();

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("rol", user.rol);
    formData.append("image", user.image || "");

    const url = params.id ? `/api/admin/users/${params.id}` : "/api/admin/users";
    const method = params.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
      await res.json();
    } catch (error) {
      console.error(
        params.id ? "Error al actualizar el usuario:" : "Error al crear el usuario:",
        error
      );
    }

    alert("Usuario registrado");
    form.current.reset();
    router.push("/admin/users");
    router.refresh();
  };

  return (
    <>
      <Link
        href={params.id ? `/admin/users/${params.id}` : "/admin/users"}
        className="bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl"
      >
        <FaArrowLeft />
      </Link>

      <form onSubmit={handleSubmit} ref={form} className="md:pl-3">
        <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-2 justify-center mb-4">
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto ml-4 max-[420px]:w-full">
            <div className="mb-1">
              <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Id:</h2>
              <h3 className="bg-white text-gray-400 py-1 px-2 rounded-md">{user.id || "####"}</h3>
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
                value={user.name}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                autoFocus
                required
                disabled={bloqueado}
              />
            </div>
            <div className="mb-1">
              <label htmlFor="email" className="text-lg font-semibold pr-1 mb-1 block">
                Email:
              </label>
              <input
                name="email"
                id="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                value={user.email}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                required
                disabled={bloqueado}
              />
            </div>
            <div className="mb-1">
              <label htmlFor="rol" className="text-lg font-semibold pr-1 mb-1 block">
                Rol:
              </label>
              <select
                name="rol"
                id="rol"
                onChange={handleChange}
                value={user.rol}
                className="hover:bg-blue-200 max-[420px]:text-center py-1 px-2 rounded-md w-full"
                required
                disabled={bloqueado}
              >
                <option value="">Selecciona una categoría</option>
                <option value="Cliente">Cliente</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Delivery">Delivery</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="max-[420px]:text-center text-left mx-auto">
            <p className="text-lg font-semibold pr-1 mb-1 block">Foto:</p>
            <div className="grid grid-cols-1">
              <div className="relative">
                <Image
                  src={user.image || ImageNotSupported}
                  className="rounded-md drop-shadow-6xl m-auto"
                  alt={user.name}
                  width={200}
                  height={200}
                />
                <div className="text-xs absolute max-[420px]:top-1/3 top-2/3 left-0 w-full flex justify-center">
                  <button
                    type="button"
                    onClick={() => setGaleriaAbierta(true)}
                    className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white py-1 px-3 rounded-xl shadow-6xl mx-auto"
                    disabled={bloqueado}
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          className="text-white bg-[#6ed8bf] hover:bg-[#4bb199] font-bold py-1 px-2 rounded-xl shadow-6xl mx-auto w-fit"
          disabled={bloqueado}
        >
          {params.id ? "Actualizar Usuario" : "Crear Usuario"}
        </button>
      </form>

      <GaleriaModal
        abierto={galeriaAbierta}
        onClose={() => setGaleriaAbierta(false)}
        onSelect={(url) => setUser(prev => ({ ...prev, image: url }))}
      />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">Usuario Protegido</h2>
            <p className="mb-4">
              Este usuario no puede ser editado. Consulte con un desarrollador si necesita realizar cambios.
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                router.push("/admin/users");
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </>
  );
}