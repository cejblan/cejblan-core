"use client"

import Link from "next/link"
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"
import { useBranding } from "@/hooks/useBranding"
import { Hoverable } from "@/hooks/hoverable"

export default function Footer3() {
  const { palette, loading } = useBranding()

  if (loading) return null

  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <footer
        id="footer"
        role="contentinfo"
        className="relative z-30 w-full px-6 py-4 backdrop-blur-sm"
        style={{
          background: `linear-gradient(to right, ${palette[0]}cc, ${palette[5]}cc)`, // con transparencia
          color: palette[6],
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <div className="font-medium">
            {process.env.NEXT_PUBLIC_SITE_NAME} &copy; 2025
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs">Desarrollado por</span>
            <Hoverable
              as={Link}
              href="https://www.linkedin.com/in/cejblan"
              className="font-semibold inline-flex items-center gap-1"
              hoverStyle={{ color: palette[0] }}
            >
              <span>Francisco Ramon Gonzalez Portal</span>
              <span role="img" aria-label="LinkedIn">🔗</span>
            </Hoverable>
          </div>
        </div>
      </footer>
    </DoNotShowAdmin>
    // ===END_RETURN===
  )
}
