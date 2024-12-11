import Link from "next/link"
import DoNotShowAdmin from "../admin/components/DoNotShowAdmin"

export default function FooterAdri() {
  return (
    <DoNotShowAdmin>
      <footer id="footerAdri" className="bg-gradient-to-b from-pink-700 via-purple-700 to-blue-700 text-white relative shadow-8xl p-1 w-full z-30" role="contentinfo">
        <p className="text-md">Adriliciaus Shop - © Copyright 2024 - Desarrollado por
          <Link href="/" className="font-semibold hover:text-blue-500"> Francisco González</Link>
        </p>
      </footer>
    </DoNotShowAdmin>
  )
}