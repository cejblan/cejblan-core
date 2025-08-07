"use client"
import { useEffect, useState } from "react"
import branding from "@/config/themes.json"
import Logo from "public/nuevo_logo_cejblan.webp"
import Image from "next/image"

export default function Loading3({ zIndex }) {
  const { palette } = branding
  const [bubbles, setBubbles] = useState([])

  useEffect(() => {
    const generateBubbles = () => {
      return Array.from({ length: 8 }).map((_, index) => ({
        id: index,
        width: `${Math.random() * 40 + 10}px`,
        height: `${Math.random() * 40 + 10}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 4 + 3}s`,
        animationDelay: `${Math.random() * 2}s`,
      }))
    }

    setBubbles(generateBubbles())
  }, [])

  return (
    // ===START_RETURN===
    <section
      className="fixed inset-0 flex flex-col justify-center items-center text-xl font-semibold"
      style={{
        zIndex,
        background: `linear-gradient(to bottom, ${palette[5]}, ${palette[0]})`,
        color: palette[6],
        overflow: "hidden",
      }}
    >
      {/* Burbuja flotante */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full opacity-20 blur-sm animate-float"
          style={{
            backgroundColor: palette[6],
            width: bubble.width,
            height: bubble.height,
            top: bubble.top,
            left: bubble.left,
            animationDuration: bubble.animationDuration,
            animationDelay: bubble.animationDelay,
          }}
        />
      ))}

      <div className="relative z-10 text-center flex flex-col items-center">
        <Image
          className="w-[140px] h-auto mb-4"
          src={Logo}
          alt="Logo tienda"
          width={200}
          height={200}
        />
        <p className="animate-dots text-2xl">Cargando</p>
      </div>
    </section>
    // ===END_RETURN===
  )
}
