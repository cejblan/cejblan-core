"use client";
import { useRouter } from "next/navigation";

function Buttons({ productId }) {
  const router = useRouter();

  return (
    <div className="flex gap-x-2 justify-center">
      <button
        className="text-white bg-red-600 hover:bg-red-800 font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={async () => {
          if (confirm("¿Adri, segura que lo quieres eliminar?")) {
            try {
              const res = await fetch(`/api/admin/products/${productId}`, {
                method: "DELETE",
              });
              if (res.status === 204) {
                router.push("/adriliciaus/admin/products");
                router.refresh();
              } else {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
              }
            } catch (error) {
              console.error("Error al eliminar el producto:", error);
            }
          }          
        }}
      >
        Eliminar
      </button>
      <button
        className="text-white bg-blue-700 hover:bg-blue-900 font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={() => {
          router.push(`/adriliciaus/admin/products/${productId}/edit`);
        }}
      >
        Editar
      </button>
    </div>
  );
}

export default Buttons;
