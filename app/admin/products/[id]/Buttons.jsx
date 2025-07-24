"use client";
import { useRouter } from "next/navigation";

function Buttons({ productId }) {
  const router = useRouter();

  return (
    <div className="flex gap-x-2 justify-center">
      <button
        className="text-white bg-red-600 hover:bg-red-800 font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={async () => {
          if (confirm("¿seguro lo quieres eliminar?")) {
            try {
              const res = await fetch(`/api/admin/products/${productId}`, {
                method: "DELETE",
              });
              if (res.status === 204) {
                router.push("/admin/products");
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
        className="text-white bg-[#6ed8bf] hover:bg-[#4bb199] font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={() => {
          router.push(`/admin/products/${productId}/edit`);
        }}
      >
        Editar
      </button>
    </div>
  );
}

export default Buttons;
