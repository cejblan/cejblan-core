"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [colores, setColores] = useState([]);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    async function obtenerBranding() {
      try {
        const res = await fetch("/api/branding");
        const data = await res.json();

        if (Array.isArray(data.palette) && data.logo) {
          setColores(data.palette);
          setLogo(data.logo);
        } else {
          console.warn("Datos de branding incompletos");
        }
      } catch (error) {
        console.error("Error al obtener configuración por defecto:", error);
      }
    }

    obtenerBranding();
  }, []);

  return (
    <nav
      className="w-full flex items-center justify-between p-4 shadow"
      style={{
        backgroundColor: colores[0] || "#f8fafc", // color de fondo
        color: colores[2] || "#1e293b", // texto
      }}
    >
      {/* Logo */}
      {logo ? (
        <Image
          src={logo}
          alt="Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      ) : (
        <div className="text-xl font-bold">CejblanCMS</div>
      )}

      {/* Botones */}
      <div className="flex gap-4">
        <button
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: colores[1] || "#4bb199",
            color: colores[3] || "#ffffff",
          }}
        >
          Iniciar sesión
        </button>
        <button
          className="px-4 py-2 rounded border"
          style={{
            borderColor: colores[2] || "#1e293b",
            color: colores[2] || "#1e293b",
          }}
        >
          Registrarse
        </button>
      </div>
    </nav>
  );
}
