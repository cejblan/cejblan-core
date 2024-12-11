"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Titulos from "@/components/Titulos";
import { LoadDeliveries } from "../components/LoadDeliveries";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    LoadDeliveries(setDeliveries);
  }, [setDeliveries]);

  if (deliveries.length === 0) {
    return (
      <h1 className="max-[420px]:text-base text-2xl text-center p-1 mx-auto">
        Cargando formas de entrega...
      </h1>
    );
  };

  return (
    <>
      <Titulos texto="Formas de Entrega" />
      <table className="table-auto bg-white text-slate-900 tracking-tight rounded-xl shadow-6xl w-full">
        <thead className="bg-slate-300 max-[420px]:text-xs text-lg font-semibold">
          <tr>
            <td className="border-r border-b border-slate-900 rounded-tl-xl">Nombre</td>
            <td className="border-r border-b border-slate-900">Datos</td>
            <td className="border-r border-b border-slate-900">Condición</td>
            <td className="bg-slate-600 text-white border-b border-slate-900 rounded-tr-xl">Acción</td>
          </tr>
        </thead>
        <tbody className="max-[420px]:text-xs text-base">
          {
            deliveries.map((deliveries, index) => {
              return (
                <tr key={index}>
                  <td className="border-r border-t border-slate-900">{deliveries.name}</td>
                  <td className="border-r border-t border-slate-900">{deliveries.data}</td>
                  <td className="border-r border-t border-slate-900">{deliveries.status}</td>
                  <td className="py-1 border-t border-slate-900">
                    <Link
                      href={`/adriliciaus/admin/deliveries/${deliveries.id}`}
                      className="text-white bg-blue-700 hover:bg-blue-900 font-bold px-2 rounded-xl shadow-6xl m-auto w-fit block"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </>
  )
}