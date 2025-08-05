"use client"

import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { FaCartShopping } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5"
import { MdAdminPanelSettings } from "react-icons/md"
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"
import Loading from "./Loading"
import { useBranding } from "@/hooks/useBranding"
import { Hoverable } from "@/hooks/hoverable"

export default function Navbar2() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { palette, logo, loading } = useBranding()

  if (status === "loading" || loading) return <Loading zIndex={50} />

  function isActive(href) {
    return pathname === href
      ? { backgroundColor: palette[5], color: palette[6] }
      : { backgroundColor: "transparent", color: palette[6] }
  }

  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <nav
        className="w-full fixed top-0 z-40 shadow-8xl h-12 px-4 grid grid-cols-3 items-center"
        style={{
          background: `linear-gradient(to right, ${palette[0]}, ${palette[5]})`,
          color: palette[6],
        }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            {logo && (
              <Image
                src={logo}
                alt="Logo"
                width={200}
                height={200}
                className="h-8 w-auto drop-shadow-6xl"
              />
            )}
          </Link>
        </div>

        {/* Menú centrado estilo dock */}
        <ul className="flex justify-center space-x-6 text-sm font-medium">
          {[
            { label: "Inicio", href: "/" },
            { label: "Catálogo", href: "/products" },
            { label: "Pedidos", href: "/orders" },
          ].map(({ label, href }) => (
            <li key={href}>
              <Link href={href}>
                <Hoverable
                  as="span"
                  className="px-3 py-1 rounded-full transition-all duration-200"
                  style={isActive(href)}
                  hoverStyle={{
                    backgroundColor: palette[3],
                    color: palette[0],
                  }}
                >
                  {label}
                </Hoverable>
              </Link>
            </li>
          ))}
        </ul>

        {/* Acciones derecha */}
        <div className="flex justify-end items-center space-x-4">
          {session?.user ? (
            <>
              <Hoverable
                as={Link}
                href="/cart"
                hoverStyle={{ color: palette[0] }}
              >
                <FaCartShopping className="w-5 h-5" />
              </Hoverable>

              <Hoverable
                as={Link}
                href="/profile"
                hoverStyle={{ color: palette[0] }}
              >
                <IoPersonSharp className="w-5 h-5" />
              </Hoverable>

              {["Admin", "Desarrollador", "Vendedor", "Delivery"].includes(session.user.role) && (
                <Hoverable
                  as={Link}
                  href="/admin"
                  hoverStyle={{ color: palette[0] }}
                >
                  <MdAdminPanelSettings className="w-5 h-5" />
                </Hoverable>
              )}

              <Hoverable
                as="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                hoverStyle={{ color: palette[0] }}
              >
                <FaSignOutAlt className="w-5 h-5" />
              </Hoverable>
            </>
          ) : (
            <Hoverable
              as="button"
              onClick={() => signIn()}
              className="flex items-center space-x-1"
              hoverStyle={{ color: palette[0] }}
            >
              <span className="text-sm">Ingresar</span>
              <FaSignInAlt className="w-4 h-4" />
            </Hoverable>
          )}
        </div>
      </nav>

      {/* Espacio para evitar que el contenido quede oculto debajo del nav */}
      <div className="h-12" />
    </DoNotShowAdmin>
    // ===END_RETURN===
  )
}
