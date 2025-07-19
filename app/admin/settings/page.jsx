"use client"

import { useEffect, useState } from "react"

export default function Settings() {
  const [activa, setActiva] = useState(false)
  const [moneda, setMoneda] = useState("USD")
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [nombreTienda, setNombreTienda] = useState("")
  const [rifTienda, setRifTienda] = useState("")
  const [direccionTienda, setDireccionTienda] = useState("")

  const [workingHours, setWorkingHours] = useState("")
  const [deliveryHours, setDeliveryHours] = useState("")

  const [deliveryGratisActivo, setDeliveryGratisActivo] = useState(false)
  const [limiteDeliveryGratis, setLimiteDeliveryGratis] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        const activaConfig = data.find(s => s.name === "conversion_activa")
        const monedaConfig = data.find(s => s.name === "conversion_moneda")

        const nombre = data.find(s => s.name === "nombre_tienda")
        const rif = data.find(s => s.name === "rif_tienda")
        const direccion = data.find(s => s.name === "direccion_tienda")
        const horario = data.find(s => s.name === "working_hours")
        const entregas = data.find(s => s.name === "delivery_hours")

        const freeDeliveryActivated = data.find(s => s.name === "free_delivery_activated")
        const freeDeliveryLimit = data.find(s => s.name === "free_delivery")

        if (freeDeliveryActivated) setDeliveryGratisActivo(freeDeliveryActivated.value === "true")
        if (freeDeliveryLimit) setLimiteDeliveryGratis(freeDeliveryLimit.value)

        if (activaConfig) setActiva(activaConfig.value === "true")
        if (monedaConfig) setMoneda(monedaConfig.value)

        if (nombre) setNombreTienda(nombre.value)
        if (rif) setRifTienda(rif.value)
        if (direccion) setDireccionTienda(direccion.value)
        if (horario) setWorkingHours(horario.value) // NUEVO
        if (entregas) setDeliveryHours(entregas.value) // NUEVO
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

      await actualizar("working_hours", workingHours)
      await actualizar("delivery_hours", deliveryHours)

      await actualizar("free_delivery_activated", deliveryGratisActivo ? "true" : "false")
      await actualizar("free_delivery", limiteDeliveryGratis)

      alert("Configuraciones guardadas correctamente")
    } catch (error) {
      console.error(error)
      alert("Hubo un error al guardar las configuraciones")
    } finally {
      setGuardando(false)
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

        {/* NUEVO: Horario laboral */}
        <div>
          <label className="block font-semibold mb-1">Horario de trabajo</label>
          <input
            type="text"
            placeholder="Ej: 08:00-18:00"
            className="w-full p-2 border rounded"
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
          />
        </div>

        {/* NUEVO: Horas de entrega */}
        <div>
          <label className="block font-semibold mb-1">Horas exactas de entrega</label>
          <input
            type="text"
            placeholder="Ej: 10:00,12:00,14:00"
            className="w-full p-2 border rounded"
            value={deliveryHours}
            onChange={(e) => setDeliveryHours(e.target.value)}
          />
          <p className="text-sm text-slate-500 mt-1">
            Si se deja vacío, se usarán los rangos del horario de trabajo.
          </p>
        </div>

        {/* NUEVO: Activar Delivery Gratis */}
        <div className="flex gap-2 items-center">
          <label className="font-semibold ml-auto">¿Activar Delivery Gratis?</label>
          <input
            type="checkbox"
            checked={deliveryGratisActivo}
            onChange={(e) => setDeliveryGratisActivo(e.target.checked)}
            className="mr-auto w-4 h-4"
          />
        </div>

        {/* NUEVO: Límite para Delivery Gratis */}
        {deliveryGratisActivo && (
          <div>
            <label className="block font-semibold mb-1">Límite para Delivery Gratis</label>
            <input
              type="text"
              placeholder="Ejemplo: 50"
              className="w-full p-2 border rounded"
              value={limiteDeliveryGratis}
              onChange={(e) => setLimiteDeliveryGratis(e.target.value)}
            />
            <p className="text-sm text-slate-500 mt-1">
              Monto mínimo de compra para aplicar envío gratis (Sin símbolo monetario).
            </p>
          </div>
        )}

        <button
          onClick={guardarCambios}
          className="bg-[#6ed8bf] text-white py-2 px-4 rounded hover:bg-[#6ed8bf]"
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  )
}
