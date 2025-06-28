"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaRegWindowMinimize, FaRegWindowMaximize, FaRegWindowClose } from "react-icons/fa";
import Gato404 from "public/Gato404.webp";

export default function Client404() {
  const router = useRouter();

  const handleActions = (e) => {
    const action = e.currentTarget.dataset.action;
    if (action === "go-back") router.back();
  };

  return (
    <section className="font-bold text-center max-[420px]:px-4 pb-8 px-8 grid grid-cols-1 justify-center items-center">
      <div className="rounded-xl shadow-5xl">
        <div className="bg-gradient-to-b from-[#0A192F] to-[#64FFDA] p-0.5 rounded-t-xl w-full flex justify-end">
          <div className="w-fit flex gap-1">
            <FaRegWindowMinimize className="bg-white p-0.5 rounded h-3 w-3" />
            <FaRegWindowMaximize className="bg-white p-0.5 rounded h-3 w-3" />
            <FaRegWindowClose className="bg-white p-0.5 rounded h-3 w-3" />
          </div>
        </div>
        <div className="bg-slate-200 rounded-b-xl max-[420px]:block flex items-center">
          <div className="p-6 w-full">
            <h1 className="max-[420px]:text-4xl text-5xl">404 - Página no encontrada</h1>
            <p className="max-[420px]:text-2xl text-3xl mb-3">Lo sentimos, no podemos encontrar lo que buscas.</p>
            <button
              data-action="go-back"
              onClick={handleActions}
              className="bg-[#64FFDA] max-[420px]:text-xl text-2xl text-[#0A192F] hover:text-blue-600 py-1 px-2 rounded-xl shadow-6xl underline">
              Regresar a la página anterior
            </button>
          </div>
          <div className="max-[420px]:w-full w-1/2 flex justify-end items-end">
            <Image className="drop-shadow-6xl mx-auto" src={Gato404} alt="Logo 404" width={300} height={300} />
          </div>
        </div>
      </div>
    </section>
  );
}