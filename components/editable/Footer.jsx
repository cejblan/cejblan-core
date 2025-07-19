import Link from "next/link"
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"

export default function Footer() {
  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <footer id="footer" className="bg-gradient-to-b from-[#6ed8bf] to-[#0A192F] text-[#F8F8F8] relative shadow-8xl p-1 w-full z-30" role="contentinfo">
        <p className="text-md">{process.env.NEXT_PUBLIC_SITE_NAME} - © Copyright 2024 - Desarrollado por
          <Link href="www.linkedin.com/in/cejblan" className="font-semibold hover:text-blue-500"> Francisco González</Link>
        </p>
      </footer>
    </DoNotShowAdmin>
    // ===END_RETURN===
  )
}