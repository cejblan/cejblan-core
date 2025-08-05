"use client"

import Link from "next/link"
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"
import { useBranding } from "@/hooks/useBranding"
import { Hoverable } from "@/hooks/hoverable"

export default function Footer() {
  const { palette, loading } = useBranding()

  if (loading) return null

  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <footer className="bg-blue-600 text-center text-lg w-full text-white py-3 shadow-4xl z-10 sm:mt-2 lg:mt-0" role="contentinfo">
        <div className="flex justify-center items-center">
          <div className="mx-auto flex">
            <Image
              className="rounded-full shadow-6xl m-auto"
              src={Logo}
              alt="Desarrollado por Cejblan"
              width={81}
              height={81}
            />
            <Image
              className="rounded-full drop-shadow-6xl m-auto"
              src={Logo2}
              alt="Desarrollado por Cejblan"
              width={200}
              height={200}
            />
          </div>
          <Link
            className="font-bold bg-orange-500 hover:bg-orange-600 rounded-2xl px-2 m-auto h-5 shadow-6xl"
            href="/politicaPrivacidad"
          >
            <p className="mt-1 sm:w-full">Políticas de Privacidad</p>
          </Link>
        </div>
        <p className="px-2 sm:px-4">Desarrollado con Next.js, React y TailwindCSS - © Copyright 2024 - Francisco González</p>
      </footer>
    </DoNotShowAdmin>
    // ===END_RETURN===
  )
}