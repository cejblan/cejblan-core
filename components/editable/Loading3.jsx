"use client"

import Image from "next/image"
import Logo from "public/nuevo_logo_cejblan.webp"
import branding from "@/config/branding.json"

export default function Loading2({ zIndex }) {
  const { palette } = branding

  return (
    // ===START_RETURN===
    <section
      className="fixed inset-0 flex justify-center items-center"
      style={{
        zIndex: zIndex,
        background: `radial-gradient(circle at center, ${palette[0]} 0%, ${palette[5]} 100%)`,
        color: palette[6],
      }}
    >
      <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl shadow-xl p-6 max-w-xs w-full text-center animate-fade-in">
        <Image
          className="mx-auto mb-4 w-32 h-32 object-contain drop-shadow-xl"
          src={Logo}
          alt="Logo de la tienda"
          width={128}
          height={128}
        />
        <p className="text-lg font-mono tracking-wider">
          Cargando
          <span className="animate-pulse delay-[0ms]">.</span>
          <span className="animate-pulse delay-[100ms]">.</span>
          <span className="animate-pulse delay-[200ms]">.</span>
        </p>
      </div>
    </section>
    // ===END_RETURN===
  )
}