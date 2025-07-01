import TruncateCart from "./components/TruncateCart";
import TruncateWishlist from "./components/TruncateWishlist";

export default function AdminPage() {
  return (
    <>
      <div className="bg-white text-slate-800 max-[420px]:p-2 p-4 mb-4 rounded-xl">
        <h1 className="max-[420px]:text-2xl text-5xl font-bold">¡Bienvenido a CejBlan!</h1>
        <p className="max-[420px]:text-xl text-2xl font-semibold">Versión: 1.0.0</p>
      </div>
      <div className="mb-4 max-[420px]:text-xs">
        <div className="bg-white text-red p-2 rounded-xl shadow-6xl">
          <h1 className="bg-blue-500 text-white text-lg font-bold py-1 max-[420px]:px-1 px-2 rounded-xl m-auto w-fit">Área de Mantenimiento</h1>
          <div className="bg-white py-1 flex gap-1 justify-center items-center">
            <TruncateCart />
            <TruncateWishlist />
          </div>
        </div>
      </div>
    </>
  )
}