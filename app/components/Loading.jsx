import Image from "next/image"
import Logo from "public/adriliciaus/logo_adriliciaus.png"

export default function Loading(zIndex) {
  return (
    <section className={"bg-gradient-to-b from-blue-700 via-purple-700 to-pink-700 text-white text-4xl font-bold max-[420px]:p-1 p-2 w-full flex justify-center items-center fixed z-" + zIndex["zIndex"]}>
      <div className="relative max-[420px]:bottom-2">
        <Image className="w-full" src={Logo} alt="Logo de la tienda" width={200} height={200} />
        <div className="flex justify-center items-center">
          <p className="animate-dots">Cargando</p>
          <span className="animate-[dots_1.1s_linear_infinite]">.</span>
          <span className="animate-[dots_1.2s_linear_infinite]">.</span>
          <span className="animate-[dots_1.3s_linear_infinite]">.</span>
        </div>
      </div>
    </section>
  );
}
