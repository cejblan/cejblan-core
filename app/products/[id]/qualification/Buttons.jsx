"use client";

import { useRef, useState } from "react";
import { BsFillBookmarkStarFill } from "react-icons/bs";
import { HiOutlineStar, HiStar } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Buttons({ params, users }) {
  const form = useRef(null);
  const [value, setValue] = useState([true, false, false, false, false]);
  const [comment, setComment] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const handleButtonChange = (index) => {
    const newButtonsState = value.map((_, i) => i <= index); // Optimización del manejo de botones
    setValue(newButtonsState);
  };
  const handleTextareaChange = (e) => {
    setComment(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Determinar la calificación final con base en el último botón activo
    const valueEnd = value.lastIndexOf(true) + 1;
    const formData = new FormData();
    formData.append("product", params.id);
    formData.append("user", session?.user?.email || "Usuario desconocido");
    formData.append("comment", comment || "Sin comentarios");
    formData.append("value", valueEnd);

    try {
      const url = `/api/qualification`;
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Calificación enviada");
      alert("Calificación enviada con éxito");
      // Reiniciar el formulario y el estado
      setValue([false, false, false, false, false]);
      setComment("");
      // Redirigir al usuario
      router.push("/products");
    } catch (error) {
      console.error("Error al enviar calificación:", error);
      alert("Hubo un error al enviar tu calificación. Intenta nuevamente.");
    }
  };

  if (users.includes(session?.user.email)) {
    alert("Ya calificaste este producto");
    router.push("/products");
  }

  return (
    <>
      <div className="pt-2 flex justify-center items-center">
        <BsFillBookmarkStarFill className="text-pink-700 h-7 w-7" />
        {value.map((state, index) => (
          <button
            key={index}
            onClick={() => handleButtonChange(index)}
            className="text-5xl text-purple-700"
          >
            {state ? <HiStar /> : <HiOutlineStar />}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} ref={form}>
        <div className="my-1">
          <label
            htmlFor="comment"
            className="text-lg font-semibold pr-1 mb-1 block"
          >
            Comentario:
          </label>
          <textarea
            name="comment"
            id="comment"
            rows={2}
            placeholder="Comentario"
            onChange={handleTextareaChange}
            value={comment}
            className="bg-slate-200 text-slate-800 max-[420px]:text-center py-1 px-2 rounded-md w-full"
          />
        </div>
        <button className="bg-gradient-to-b from-blue-700 via-purple-700 to-pink-700 text-white font-bold py-1 px-2 rounded-xl">
          Enviar
        </button>
      </form>
    </>
  );
}