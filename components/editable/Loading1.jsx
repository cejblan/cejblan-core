// Loading.jsx
"use client"

import Image from "next/image"
import branding from "@/config/themes.json"

export default function Loading1({ zIndex }) {
  const { palette, logo } = branding

  return (
    // ===START_RETURN===
    <section
      className="text-4xl font-bold max-[420px]:p-1 p-2 w-full flex justify-center items-center fixed"
      style={{
        background: `linear-gradient(to bottom, ${palette[5]}, ${palette[0]}, ${palette[5]})`,
        color: palette[6],
        zIndex: zIndex,
      }}
    >
      <div className="relative max-[420px]:bottom-2">
        <Image
          className="p-4 w-full"
          src={logo}
          alt="Logo de la tienda"
          width={100}
          height={100}
        />
        <div className="flex justify-center items-center">
          <p className="animate-dots">Cargando</p>
          <span className="animate-[dots_1.1s_linear_infinite]">.</span>
          <span className="animate-[dots_1.2s_linear_infinite]">.</span>
          <span className="animate-[dots_1.3s_linear_infinite]">.</span>
        </div>
      </div>
    </section>
    // ===END_RETURN===
  )
}
