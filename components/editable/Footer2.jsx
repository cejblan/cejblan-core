"use client"

import Link from "next/link"
import Image from "next/image"
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"
import { useBranding } from "@/hooks/useBranding"
import { Hoverable } from "@/hooks/hoverable"

export default function Footer2() {
  const { palette, logo, loading } = useBranding()

  if (loading) return null

  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <footer
        className="w-full text-center text-lg py-4 shadow-8xl z-20"
        role="contentinfo"
        style={{
          background: `linear-gradient(to bottom, ${palette[0]}, ${palette[5]})`,
          color: palette[6],
        }}
      >
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-3">
          <div className="flex gap-6 justify-center">
            {logo && (
              <Image
                src={logo}
                alt="Logo"
                width={300}
                height={300}
              />
            )}
          </div>

          <Hoverable
            as={Link}
            href="/privacy"
            className="font-bold text-sm px-4 py-1 rounded-2xl transition-all duration-200 shadow-md border-[1px] border-solid"
            hoverStyle={{
              backgroundColor: palette[5],
              color: palette[0],
              borderColor: palette[6],
            }}
            style={{
              backgroundColor: palette[3],
              color: palette[6],
            }}
          >
            Políticas de Privacidad
          </Hoverable>
        </div>

        <p className="text-sm px-4">
          Desarrollado con <strong>React</strong>, <strong>Next.js</strong> y <strong>TailwindCSS</strong> — © Copyright 2024-{new Date().getFullYear()} —{" "}
          <Hoverable
            as={Link}
            href="https://www.linkedin.com/in/cejblan"
            className="underline"
            hoverStyle={{ color: palette[2] }}
          >
            Francisco Ramon Gonzalez Portal
          </Hoverable>
        </p>
      </footer>
    </DoNotShowAdmin>
    // ===END_RETURN===
  )
}
