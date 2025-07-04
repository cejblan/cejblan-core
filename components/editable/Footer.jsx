import Link from "next/link"
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"

export default function Footer() {
  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <footer id="footer" className="bg-gradient-to-b from-[#64FFDA] to-[#0A192F] text-[#F8F8F8] relative shadow-8xl p-1 w-full z-30" role="contentinfo">
        <p className="text-md">Cejblan Shop - © Copyright 2024 - Desarrollado por
          <Link href="/" className="font-semibold hover:text-blue-500"> Francisco González</Link>
        </p>
      </footer>
    </DoNotShowAdmin>
    // ===END_RETURN===
  )
}