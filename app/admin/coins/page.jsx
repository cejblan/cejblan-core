'use client'

import { useEffect, useState } from 'react'
import Titulos from '@/components/Titulos'

export default function Coins() {
  const [tasas, setTasas] = useState({ USD: '', EUR: '' })

  useEffect(() => {
    async function obtenerTasas() {
      try {
        const res = await fetch('/api/bcv')
        const json = await res.json()
        if (json.tasas) {
          setTasas(json.tasas)
        }
      } catch (err) {
        console.error('Error al obtener tasas desde la API:', err)
      }
    }

    obtenerTasas()
  }, [])

  return (
    <>
      <Titulos texto="Monedas" />
      <div className="gap-2 grid">
        <div className="justify-center content-center flex gap-2">
          <p className="bg-slate-300 text-3xl p-1 border border-solid border-spacing-2 border-gray-400 block">
            <strong className="text-5xl">$</strong> BCV:
          </p>
          <input
            className="text-3xl p-1 border border-solid border-gray-400 block"
            type="text"
            readOnly
            value={tasas.USD}
          />
        </div>
        <div className="justify-center content-center flex gap-2">
          <p className="bg-slate-300 text-3xl p-1 border border-solid border-spacing-2 border-gray-400 block">
            <strong className="text-5xl">€</strong> BCV:
          </p>
          <input
            className="text-3xl p-1 border border-solid border-gray-400 block"
            type="text"
            readOnly
            value={tasas.EUR}
          />
        </div>
      </div>
    </>
  )
}
