"use client"

import { useState, useEffect } from "react";
import TruncateCart from "@/app/admin/components/TruncateCart";
import TruncateWishlist from "@/app/admin/components/TruncateWishlist";
import Titulos from "@/components/editable/Titulos";

export default function Developer() {
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoValor, setNuevoValor] = useState("")
  const [nuevoDescription, setNuevoDescription] = useState("")
  const [configuraciones, setConfiguraciones] = useState([])

  const registrarConfiguracion = async () => {
    if (!nuevoNombre || !nuevoValor) {
      return alert('Debes completar al menos "name" y "value"')
    }

    const formDescription = new FormData()
    formDescription.append("name", nuevoNombre)
    formDescription.append("value", nuevoValor)
    formDescription.append("description", nuevoDescription)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        body: formDescription,
      })

      if (!res.ok) throw new Error("Error al registrar configuración")
      alert("Configuración registrada")

      setNuevoNombre("")
      setNuevoValor("")
      setNuevoDescription("")
      obtenerConfiguraciones() // recarga la lista
    } catch (error) {
      console.error(error)
      alert("Hubo un error al registrar la nueva configuración")
    }
  }

  const obtenerConfiguraciones = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      setConfiguraciones(data)
    } catch (error) {
      console.error("Error al cargar configuraciones:", error)
    }
  }

  useEffect(() => {
    obtenerConfiguraciones()
  }, [])

  return (
    <>
      <Titulos texto="Desarrollador" />
      <div className="mb-4 max-[420px]:text-xs">
        <div className="bg-white text-red p-2 rounded-xl shadow-6xl">
          <h1 className="bg-blue-500 text-white text-lg font-bold py-1 max-[420px]:px-1 px-2 rounded-xl m-auto w-fit">
            Área de Mantenimiento
          </h1>
          <div className="bg-white py-1 flex gap-1 justify-center items-center">
            <TruncateCart />
            <TruncateWishlist />
          </div>
        </div>
      </div>

      {/* Formulario nueva configuración */}
      <div className="bg-gray-100 p-4 border rounded-xl shadow-6xl mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Registrar nueva configuración</h2>
        <input
          type="text"
          placeholder="Nombre (name)"
          className="w-full p-2 border rounded"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Valor (value)"
          className="w-full p-2 border rounded"
          value={nuevoValor}
          onChange={(e) => setNuevoValor(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción (description)"
          className="w-full p-2 border rounded"
          value={nuevoDescription}
          onChange={(e) => setNuevoDescription(e.target.value)}
        />
        <button
          onClick={registrarConfiguracion}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Registrar nueva configuración
        </button>
      </div>

      {/* Tabla de configuraciones guardadas */}
      <div className="bg-white p-4 border rounded-xl shadow-6xl mt-6">
        <h2 className="text-lg font-semibold mb-4">Configuraciones guardadas</h2>
        {configuraciones.length === 0 ? (
          <p className="text-gray-500">No hay configuraciones registradas.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-2 py-1 border">Nombre</th>
                  <th className="px-2 py-1 border">Valor</th>
                  <th className="px-2 py-1 border">Descripción</th>
                  <th className="px-2 py-1 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {configuraciones.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-2 py-1 border">{item.name}</td>
                    <td className="px-2 py-1 border">{item.value}</td>
                    <td className="px-2 py-1 border">{item.description}</td>
                    <td className="px-2 py-1 border">
                      <div className="flex content-center gap-1">
                        <button className="text-blue-600 hover:underline">Editar</button>
                        <button className="text-red-600 hover:underline">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}