"use client"

import { useState } from "react"
import TruncateCart from "@/app/admin/components/TruncateCart";
import TruncateWishlist from "@/app/admin/components/TruncateWishlist";
import Titulos from "@/components/editable/Titulos";

export default function Developer() {
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoValor, setNuevoValor] = useState("")
  const [nuevoDescription, setNuevoDescription] = useState("")

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
    } catch (error) {
      console.error(error)
      alert("Hubo un error al registrar la nueva configuración")
    }
  }

  return (
    <>
      <Titulos texto="Desarrollador" />
      <div className="mb-4 max-[420px]:text-xs">
        <div className="bg-white text-red p-2 rounded-xl shadow-6xl">
          <h1 className="bg-blue-500 text-white text-lg font-bold py-1 max-[420px]:px-1 px-2 rounded-xl m-auto w-fit">Área de Mantenimiento</h1>
          <div className="bg-white py-1 flex gap-1 justify-center items-center">
            <TruncateCart />
            <TruncateWishlist />
          </div>
        </div>
      </div>
      <div className="border rounded p-4 bg-gray-100 space-y-4 mt-6">
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
    </>
  )
}