"use client"

import Image from "next/image"
import Logo from "public/nuevo_logo_cejblan.webp"
import branding from "@/config/branding.json"

export default function Loading3({ zIndex }) {
  const { palette } = branding

  return (
    // ===START_RETURN===
    <section
      className="fixed inset-0 flex justify-center items-center overflow-hidden"
      style={{
        zIndex,
        backgroundColor: palette[0],
        color: palette[6],
      }}
    >
      {/* Círculos animados de fondo */}
      <div className="absolute w-full h-full -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 blur-sm animate-float"
            style={{
              width: `${10 + Math.random() * 30}px`,
              height: `${10 + Math.random() * 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: palette[5],
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center space-y-6 text-center">
        <Image
          src={Logo}
          alt="Logo"
          width={160}
          height={160}
          className="animate-zoom-in drop-shadow-2xl"
        />
        <p className="text-2xl font-mono tracking-wide animate-blink">
          Cargando...
        </p>
      </div>
    </section>
    // ===END_RETURN===
  )
}
