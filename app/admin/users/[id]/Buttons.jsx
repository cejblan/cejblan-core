"use client";
import { useRouter } from "next/navigation";

function Buttons({ userId }) {
  const router = useRouter();
  let user0001;

  if (userId === "0001" || userId === 1 || userId === "1") {
    user0001 = true;
  } else {
    user0001 = false;
  }

  return (
    <div className="flex gap-x-2 justify-center">
      {!user0001 &&
        <button
          className="text-white bg-red-600 hover:bg-red-800 font-bold py-1 px-2 rounded-xl shadow-6xl"
          onClick={async () => {
            if (confirm("¿Seguro lo quieres eliminar?")) {
              try {
                const res = await fetch(`/api/admin/users/${userId}`, {
                  method: "DELETE",
                });
                if (res.status === 204) {
                  router.push("/admin/users");
                  router.refresh();
                } else {
                  throw new Error(`Error: ${res.status} ${res.statusText}`);
                }
              } catch (error) {
                console.error("Error al eliminar el usuario:", error);
              }
            }
          }}
        >
          Eliminar
        </button>
      }
      <button
        className="text-white bg-[#6ed8bf] hover:bg-[#4bb199] font-bold py-1 px-2 rounded-xl shadow-6xl"
        onClick={() => {
          router.push(`/admin/users/${userId}/edit`);
        }}
      >
        Editar
      </button>
    </div>
  );
}

export default Buttons;
