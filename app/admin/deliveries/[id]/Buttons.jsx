"use client";
import { useRouter } from "next/navigation";

function Buttons({ deliveryId }) {
  const router = useRouter();
  let delivery0001;

  if (deliveryId === "0001") {
    delivery0001 = true;
  } else {
    delivery0001 = false;
  }

  return (
    <div className="flex gap-x-2 justify-center">
      {!delivery0001 &&
        <button
          className="text-white bg-red-600 hover:bg-red-800 font-bold py-1 px-2 rounded-xl shadow-6xl"
          onClick={async () => {
            if (confirm("¿Seguro lo quieres eliminar?")) {
              try {
                const res = await fetch(`/api/admin/deliveries/${deliveryId}`, {
                  method: "DELETE",
                });

                if (res.status === 204) {
                  // Redirecciona y actualiza la página
                  router.push("/admin/deliveries");
                  router.refresh();
                } else {
                  // Manejo de errores en caso de que el estado no sea 204
                  const errorData = await res.json();
                  console.error("Error al eliminar la categoría:", errorData.message || "Error desconocido");
                  alert("No se pudo eliminar la categoría. Por favor, inténtalo de nuevo.");
                }
              } catch (error) {
                // Captura de errores en la solicitud
                console.error("Error al eliminar la categoría:", error);
                alert("Ocurrió un error al eliminar la categoría. Por favor, verifica tu conexión.");
              }
            }
          }}
        >
          Eliminar
        </button>
      }
      <button
        className="text-white bg-blue-500 hover:bg-blue-600 font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={() => {
          router.push(`/admin/deliveries/${deliveryId}/edit`);
        }}
      >
        Editar
      </button>
    </div>
  );
}

export default Buttons;
