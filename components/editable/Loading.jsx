import Image from "next/image"
import Logo from "public/nuevo_logo_cejblan.webp"

export default function Loading(zIndex) {
  return (
    // ===START_RETURN===
    <section className={"bg-gradient-to-b from-[#0A192F] via-[#6ed8bf] to-[#0A192F] text-[#F8F8F8] text-4xl font-bold max-[420px]:p-1 p-2 w-full flex justify-center items-center fixed z-" + zIndex["zIndex"]}>
      <div className="relative max-[420px]:bottom-2">
        <Image className="p-4 w-full" src={Logo} alt="Logo de la tienda" width={200} height={200} />
        <div className="flex justify-center items-center">
          <p className="animate-dots">Cargando</p>
          <span className="animate-[dots_1.1s_linear_infinite]">.</span>
          <span className="animate-[dots_1.2s_linear_infinite]">.</span>
          <span className="animate-[dots_1.3s_linear_infinite]">.</span>
        </div>
      </div>
    </section>
    // ===END_RETURN===
  );
}
