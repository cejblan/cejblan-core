"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoAlertFill } from "react-icons/go";

export default function TruncateWishlist() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Función para truncar la tabla 'cart'
  const truncateWishlist = async () => {
    setLoading(true); // Mostrar estado de cargando

    try {
      if (confirm("¿seguro quieres borrar todos los favoritos?")) {
        const response = await fetch('/api/admin/truncateWishlist', { method: 'DELETE' });
        if (response.ok) {
          alert("¡Favoritos vaciado con éxito!");
          router.refresh(); // Solo actualiza los componentes del servidor, no del cliente
          window.location.reload(); // Recarga la página del cliente
        } else {
          alert("Error al vaciar los favoritos");
        }
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Error al intentar vaciar los favoritos");
    }

    setLoading(false); // Finalizar estado de cargando
  };

  return (
    <>
      {/* Botón para truncar la tabla */}
      <button
        onClick={truncateWishlist}
        disabled={loading}
        className="bg-red-600 hover:bg-red-500 text-white max-[420px]:text-xs text-lg font-bold leading-none py-1 max-[420px]:px-1 px-2 rounded-xl flex justify-center items-center"
      >
        {loading ? <p>Vaciando...</p> : <p className="w-fit">Vaciar Tabla Favoritos</p>}
        <GoAlertFill className="max-[420px]:w-3 w-5 max-[420px]:h-3 h-5" />
      </button>

      {/* Aquí el resto de tu código de renderizado de los productos */}
    </>
  );
}
