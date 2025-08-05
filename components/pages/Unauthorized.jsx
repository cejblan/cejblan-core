import { GiCat } from "react-icons/gi";
import { FaRegWindowMinimize, FaRegWindowMaximize, FaRegWindowClose } from "react-icons/fa";

export default function Unauthorized() {
  return (
    <section className="font-bold text-center max-[420px]:px-4 pb-8 px-8 grid grid-cols-1 justify-center items-center">
      <div className="rounded-xl shadow-5xl">
        <div className="bg-gradient-to-b from-[#1e293b] to-[#6ed8bf] p-0.5 rounded-t-xl w-full flex justify-end">
          <div className="w-fit flex gap-1">
            <FaRegWindowMinimize className="bg-white p-0.5 rounded h-3 w-3" />
            <FaRegWindowMaximize className="bg-white p-0.5 rounded h-3 w-3" />
            <FaRegWindowClose className="bg-white p-0.5 rounded h-3 w-3" />
          </div>
        </div>
        <div className="bg-slate-200 rounded-b-xl max-[420px]:block flex items-center">
          <div className="p-6 w-full">
            <h1 className="max-[420px]:text-4xl text-5xl">Acceso Denegado</h1>
            <p className="max-[420px]:text-2xl text-3xl mb-3">Modulo solo para Administradores</p>
            <GiCat className="text-9xl m-auto" />
          </div>
        </div>
      </div>
    </section >
  )
}