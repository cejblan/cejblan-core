"use client"
import { useEffect, useState } from "react"

export default function Settings() {
  const [activa, setActiva] = useState(false)
  const [moneda, setMoneda] = useState("USD")
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoValor, setNuevoValor] = useState("")
  const [nuevoDescription, setNuevoDescription] = useState("")

  const [nombreTienda, setNombreTienda] = useState("")
  const [rifTienda, setRifTienda] = useState("")
  const [direccionTienda, setDireccionTienda] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        const activaConfig = data.find(s => s.name === "conversion_activa")
        const monedaConfig = data.find(s => s.name === "conversion_moneda")

        const nombre = data.find(s => s.name === "nombre_tienda")
        const rif = data.find(s => s.name === "rif_tienda")
        const direccion = data.find(s => s.name === "direccion_tienda")

        if (activaConfig) setActiva(activaConfig.value === "true")
        if (monedaConfig) setMoneda(monedaConfig.value)

        if (nombre) setNombreTienda(nombre.value)
        if (rif) setRifTienda(rif.value)
        if (direccion) setDireccionTienda(direccion.value)

      })
      .finally(() => setCargando(false))
  }, [])

  const guardarCambios = async () => {
    setGuardando(true)

    try {
      const actualizar = async (name, value = "") => {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, value }),
        })
        if (!res.ok) throw new Error(`Error al actualizar ${name}`)
      }

      await actualizar("conversion_activa", activa ? "true" : "false")
      await actualizar("conversion_moneda", moneda)
      await actualizar("nombre_tienda", nombreTienda)
      await actualizar("rif_tienda", rifTienda)
      await actualizar("direccion_tienda", direccionTienda)


      alert("Configuraciones guardadas correctamente")
    } catch (error) {
      console.error(error)
      alert("Hubo un error al guardar las configuraciones")
    } finally {
      setGuardando(false)
    }
  }

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

  if (cargando)
    return (
      <h1 className="max-[420px]:text-base text-2xl text-center p-1 mx-auto">
        Cargando configuración...
      </h1>
    )

  return (
    <div className="max-w-xl mx-auto grid gap-6">
      <h1 className="text-2xl font-bold">Configuración general</h1>
      <div className="border rounded p-4 bg-gray-50 space-y-4">
        <div className="flex gap-2 items-center">
          <label className="font-semibold ml-auto">¿Activar conversión a Bs?</label>
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
            className="mr-auto w-2 h-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Moneda base para conversión</label>
          <select
            className="w-full p-2 border rounded"
            value={moneda}
            onChange={(e) => setMoneda(e.target.value)}
          >
            <option value="USD">Dólares (USD)</option>
            <option value="EUR">Euros (EUR)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Nombre de la tienda</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={nombreTienda}
            onChange={(e) => setNombreTienda(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Dirección de la tienda</label>
          <textarea
            className="w-full p-2 border rounded"
            rows="2"
            value={direccionTienda}
            onChange={(e) => setDireccionTienda(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">RIF de la tienda</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={rifTienda}
            onChange={(e) => setRifTienda(e.target.value)}
          />
        </div>

        <button
          onClick={guardarCambios}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
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
    </div>
  )
}
