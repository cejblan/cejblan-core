"use client";
import { useRouter } from "next/navigation";

function Buttons({ payId }) {
  const router = useRouter();

  return (
    <div className="flex gap-x-2 justify-center">
      <button
        className="text-white bg-red-600 hover:bg-red-800 font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={async () => {
          if (confirm("¿Seguro lo quieres eliminar?")) {
            try {
              const res = await fetch(`/api/admin/payments/${payId}`, {
                method: "DELETE",
              });
          
              if (res.status === 204) {
                router.push("/admin/payments");
                router.refresh();
              } else {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error desconocido");
              }
            } catch (error) {
              console.error("Error al eliminar el pago:", error);
              alert("Ocurrió un error al eliminar el pago. Por favor, inténtalo nuevamente.");
            }
          }          
        }}
      >
        Eliminar
      </button>
      <button
        className="text-white bg-blue-500 hover:bg-blue-600 font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={() => {
          router.push(`/admin/payments/${payId}/edit`);
        }}
      >
        Editar
      </button>
    </div>
  );
}

export default Buttons;
