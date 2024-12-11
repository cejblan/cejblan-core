"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import ImageNotSupported from "@/public/ImageNotSupported.webp";

export default function UserForm() {
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
          if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            rol: data.rol,
            image: data.image,
          });
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("rol", user.rol);

    if (file) {
      formData.append("image", file);
    }

    const url = params.id ? `/api/admin/users/${params.id}` : "/api/admin/users";
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
        params.id ? "Usuario actualizado:" : "Usuario creado:",
        data
      );
    } catch (error) {
      console.error(
        params.id ? "Error al actualizar el usuario:" : "Error al crear el usuario:",
        error
      );
    }

    alert("Usuario registrado");
    form.current.reset();
    router.push("/admin/users");
    router.refresh(); // Solo actualiza los componentes del servidor
  };
  //Estilos input
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("Ningún archivo seleccionado");
  const handleChange2 = (event) => {
    const files = event.target.files;
    if (files.length === 0) {
      setFileName(dataEmpty);
    } else if (files.length > 1) {
      setFileName(`${files.length} archivos seleccionados`);
    } else {
      setFileName(files[0].name);
    }
    setFile(event.target.files[0]);
  };
  //Fin estilos input
  return (
    <>
      <Link href={params.id ? `/admin/users/${params.id}` : "/admin/users"} className=" bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>
      <form onSubmit={handleSubmit} ref={form} >
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
              >
                <option value="">Selecciona una categoría</option>
                <option value="Admin">Admin</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Delivery">Delivery</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>
          </div>
          <div className="max-[420px]:text-center text-left mx-auto">
            <p htmlFor="image" className="text-lg font-semibold pr-1 mb-1 block">
              Foto:
            </p>
            <div className="grid grid-cols-1">
              <div className="relative">
                <Image
                  src={file ? URL.createObjectURL(file) : user.image || ImageNotSupported}
                  className="rounded-md drop-shadow-6xl m-auto h-fit"
                  alt={user.name}
                  width={300} height={300}
                />
                <label htmlFor="image" className="text-xs absolute max-[420px]:top-1/3 top-2/3 left-0 w-full">
                  <span className="bg-blue-700 hover:bg-blue-500 text-white py-1 px-3 rounded-xl shadow-6xl mx-auto w-fit cursor-pointer block">Subir</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    className="bg-white py-1 px-2 rounded-md"
                    onChange={handleChange2}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        <button className="text-white bg-blue-700 hover:bg-blue-900 font-bold py-1 px-2 rounded-xl shadow-6xl mx-auto w-fit">
          {params.id ? "Actualizar Usuario" : "Crear Usuario"}
        </button>
      </form>
    </>
  );
}