"use client"

import Link from "next/link"
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"
import { useBranding } from "@/hooks/useBranding"
import { Hoverable } from "@/hooks/hoverable"

export default function Footer1() {
  const { palette, loading } = useBranding()

  if (loading) return null

  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <footer
        id="footer"
        role="contentinfo"
        className="relative shadow-8xl p-1 w-full z-30"
        style={{
          background: `linear-gradient(to bottom, ${palette[0]}, ${palette[5]})`,
          color: palette[6], // blanco dinámico
        }}
      >
        <p className="text-md">
          {process.env.NEXT_PUBLIC_SITE_NAME} - © Copyright 2025 - Desarrollado por{" "}
          <Hoverable
            as={Link}
            href="https://www.linkedin.com/in/cejblan"
            className="font-semibold"
            hoverStyle={{ color: palette[0] }}
          >
            Francisco Ramon Gonzalez Portal
          </Hoverable>
        </p>
      </footer>
    </DoNotShowAdmin>
    // ===END_RETURN===
  )
}