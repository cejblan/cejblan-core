"use client";

import { useRef, useState, useEffect } from "react";
import { BsFillBookmarkStarFill } from "react-icons/bs";
import { HiOutlineStar, HiStar } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Titulos from "@/components/editable/Titulos";

export default function Qualification({ id, name, users }) {
  const [value, setValue] = useState([true, false, false, false, false]);
  const [comment, setComment] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const form = useRef(null);

  useEffect(() => {
    if (session?.user?.email && users.includes(session.user.email)) {
      alert("Ya calificaste este producto");
      router.push("/products");
    }
  }, [session, users, router]);

  const handleButtonChange = (index) => {
    setValue(value.map((_, i) => i <= index));
  };

  const handleTextareaChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valueEnd = value.lastIndexOf(true) + 1;

    const formData = new FormData();
    formData.append("product", id);
    formData.append("user", session?.user?.email || "Usuario desconocido");
    formData.append("comment", comment || "Sin comentarios");
    formData.append("value", valueEnd);

    try {
      const res = await fetch(`/api/qualification`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);

      alert("Calificación enviada con éxito");
      setValue([false, false, false, false, false]);
      setComment("");
      router.push("/products");
    } catch (error) {
      console.error("Error al enviar calificación:", error);
      alert("Hubo un error al enviar tu calificación. Intenta nuevamente.");
    }
  };

  return (
    <div className="py-6">
      <Titulos texto="Califica tu apreciación del producto:" />
      <div className="bg-white p-4 rounded-xl mx-auto w-fit">
        <div className="bg-[#6ed8bf] text-2xl text-white font-bold py-1 px-2 rounded-xl mx-auto w-fit">
          {name}
        </div>
        <div className="pt-2 flex justify-center items-center">
          <BsFillBookmarkStarFill className="text-[#6ed8bf] h-7 w-7" />
          {value.map((state, index) => (
            <button
              key={index}
              onClick={() => handleButtonChange(index)}
              className="text-5xl text-slate-700"
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
          <button className="bg-gradient-to-b from-[#6ed8bf] via-slate-700 to-[#6ed8bf] text-white font-bold py-1 px-2 rounded-xl">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}