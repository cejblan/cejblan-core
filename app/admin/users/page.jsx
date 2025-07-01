"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Titulos from "@/components/Titulos";
import { LoadUsers } from "../components/LoadUsers";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    LoadUsers(setUsers);
  }, [setUsers]);

  if (users.length === 0) {
    return (
      <h1 className="max-[420px]:text-base text-2xl text-center p-1 mx-auto">
        Cargando usuarios...
      </h1>
    );
  };

  return (
    <>
      <Titulos texto="Usuarios" />
      <table className="table-auto bg-white text-slate-900 tracking-tight rounded-xl shadow-6xl w-full">
        <thead className="bg-slate-300 max-[420px]:text-xs text-lg font-semibold">
          <tr>
            <td className="border-r border-b border-slate-900 rounded-tl-xl">Nombre</td>
            <td className="border-r border-b border-slate-900">Correo</td>
            <td className="border-r border-b border-slate-900">Rol</td>
            <td className="bg-slate-600 text-white border-b border-slate-900 rounded-tr-xl">Acción</td>
          </tr>
        </thead>
        <tbody className="max-[420px]:text-xs text-base">
          {users.map((users, index) => {
            return (
              <tr key={index}>
                <td className="border-r border-t border-slate-900">{users.name}</td>
                <td className="border-r border-t border-slate-900">{users.email}</td>
                <td className="border-r border-t border-slate-900">{users.rol}</td>
                <td className="py-1 border-t border-slate-900">
                  <Link
                    href={`/admin/users/${users.id}`}
                    className="text-white bg-blue-500 hover:bg-blue-600 font-bold px-2 rounded-xl shadow-6xl m-auto w-fit block"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  )
}