"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Titulos from "@/components/Titulos";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const LoadCategories = async () => {
    try {
      const response = await fetch(`/api/admin/categories`, {
        method: "GET",
      });

      const categories = await response.json();

      if (response.ok) {
        setCategories(categories);
      } else {
        console.error("Error:", categories.error);
      }
    } catch (error) {
      console.error("Error al cargar las categorias:", error);
    }
  };

  useEffect(() => {
    LoadCategories(setCategories);
  }, []);

  if (categories.length === 0) {
    return (
      <h1 className="max-[420px]:text-base text-2xl text-center p-1 mx-auto">
        Cargando categorías...
      </h1>
    );
  };

  return (
    <>
      <Titulos texto="Categorías" />
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
            categories.map((categories, index) => {
              return (
                <tr key={index}>
                  <td className="border-r border-t border-slate-900">{categories.name}</td>
                  <td className="border-r border-t border-slate-900">{categories.data}</td>
                  <td className="border-r border-t border-slate-900">{categories.status}</td>
                  <td className="py-1 border-t border-slate-900">
                    <Link
                      href={`/admin/categories/${categories.id}`}
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