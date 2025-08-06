"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"
import { FaCartShopping } from "react-icons/fa6"
import { IoPersonSharp } from "react-icons/io5"
import { MdAdminPanelSettings } from "react-icons/md"
import { TiThMenu, TiTimes } from "react-icons/ti" // Iconos hamburguesa
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin"
import { useBranding } from "@/hooks/useBranding"
import { Hoverable } from "@/hooks/hoverable"
import branding from "@/config/themes.json";
import Loading1 from "@/components/editable/Loading1";
import Loading2 from "@/components/editable/Loading2";
import Loading3 from "@/components/editable/Loading3";

function getLoadingComponent(name) {
  switch (name) {
    case "loading1":
      return Loading1;
    case "loading2":
      return Loading2;
    case "loading3":
      return Loading3;
    default:
      return Loading1;
  }
}

export default function Navbar2() {
  const [isOpen, setIsOpen] = useState(false) // Estado para menú móvil abierto/cerrado
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const Loading = getLoadingComponent(branding.loading);
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
                className="sm:h-8 w-auto"
              />
            )}
          </Link>
        </div>

        {/* Botón hamburguesa móvil (solo en sm hacia abajo) */}
        <button
          className="sm:hidden text-2xl absolute right-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{ color: palette[6] }}
        >
          {isOpen ? <TiTimes /> : <TiThMenu />}
        </button>

        {/* Menú centrado estilo dock - oculto en móvil */}
        <div className="hidden sm:flex justify-center space-x-6 text-sm font-medium">
          {[
            { label: "Inicio", href: "/" },
            { label: "Catálogo", href: "/products" },
            { label: "Pedidos", href: "/orders" },
          ].map(({ label, href }) => (
            <div key={href}>
              <Link href={href}>
                <Hoverable
                  as="span"
                  className="px-3 py-1 rounded-full transition-all duration-200 border-[1px] border-solid"
                  style={isActive(href)}
                  hoverStyle={{
                    backgroundColor: palette[3],
                    color: palette[0],
                    borderColor: palette[6],
                  }}
                >
                  {label}
                </Hoverable>
              </Link>
            </div>
          ))}
        </div>

        {/* Acciones derecha */}
        <div className="hidden sm:flex justify-end items-center space-x-4">
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

              {["Admin", "Desarrollador", "Vendedor", "Delivery"].includes(
                session.user.role
              ) && (
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
              className="flex items-center space-x-1 transition-all duration-200"
              hoverStyle={{ color: palette[0] }}
            >
              <span className="text-sm">Ingresar</span>
              <FaSignInAlt className="w-4 h-4" />
            </Hoverable>
          )}
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {isOpen && (
        <div
          className="fixed top-12 left-0 w-full bg-white z-40 shadow-lg sm:hidden"
          style={{ backgroundColor: palette[3], color: palette[6] }}
        >
          <div className="flex flex-col p-2 space-y-1">
            {[
              { label: "Inicio", href: "/" },
              { label: "Catálogo", href: "/products" },
              { label: "Pedidos", href: "/orders" },
            ].map(({ label, href }) => (
              <div key={href}>
                <Link href={href}>
                  <Hoverable
                    as="span"
                    className="block px-4 py-2 rounded-md"
                    style={isActive(href)}
                    hoverStyle={{
                      backgroundColor: palette[5],
                      color: palette[0],
                    }}
                    onClick={() => setIsOpen(false)} // Cierra menú al click
                  >
                    {label}
                  </Hoverable>
                </Link>
              </div>
            ))}

            {session?.user ? (
              <>
                <div>
                  <Link href="/cart">
                    <Hoverable
                      as="div"
                      className="flex justify-center items-center px-4 py-2 rounded-md space-x-2 transition-all duration-200"
                      hoverStyle={{
                        backgroundColor: palette[5],
                        color: palette[0],
                      }}
                      onClick={() => setIsOpen(false)}
                    >
                      <FaCartShopping className="w-5 h-5" />
                      <span>Carrito</span>
                    </Hoverable>
                  </Link>
                </div>

                <div>
                  <Link href="/profile">
                    <Hoverable
                      as="div"
                      className="flex justify-center items-center px-4 py-2 rounded-md space-x-2 transition-all duration-200"
                      hoverStyle={{
                        backgroundColor: palette[5],
                        color: palette[0],
                      }}
                      onClick={() => setIsOpen(false)}
                    >
                      <IoPersonSharp className="w-5 h-5" />
                      <span>Perfil</span>
                    </Hoverable>
                  </Link>
                </div>

                {["Admin", "Desarrollador", "Vendedor", "Delivery"].includes(
                  session.user.role
                ) && (
                    <div>
                      <Link href="/admin">
                        <Hoverable
                          as="div"
                          className="flex justify-center items-center px-4 py-2 rounded-md space-x-2 transition-all duration-200"
                          hoverStyle={{
                            backgroundColor: palette[5],
                            color: palette[0],
                          }}
                          onClick={() => setIsOpen(false)}
                        >
                          <MdAdminPanelSettings className="w-5 h-5" />
                          <span>Admin</span>
                        </Hoverable>
                      </Link>
                    </div>
                  )}

                <div>

                  <Hoverable
                    as="button"
                    onClick={() => {
                      signOut({ callbackUrl: "/" })
                      setIsOpen(false)
                    }}
                    className="flex justify-center items-center w-full text-left px-4 py-2 rounded-md space-x-2 transition-all duration-200"
                    hoverStyle={{
                      backgroundColor: palette[5],
                      color: palette[0],
                    }}
                  >
                    <FaSignOutAlt className="inline w-5 h-5 mr-2" />
                    Cerrar sesión
                  </Hoverable>
                </div>
              </>
            ) : (
              <div>
                <Hoverable
                  as="button"
                  onClick={() => {
                    signIn()
                    setIsOpen(false)
                  }}
                  className="flex justify-center items-center w-full text-left px-4 py-2 rounded-md space-x-2 transition-all duration-200"
                  hoverStyle={{
                    backgroundColor: palette[5],
                    color: palette[0],
                  }}
                >
                  <FaSignInAlt className="inline w-5 h-5 mr-2" />
                  Ingresar
                </Hoverable>
              </div>
            )}
          </div>
        </div>
      )
      }

      {/* Espacio para evitar que el contenido quede oculto debajo del nav */}
      <div className="h-12" />
    </DoNotShowAdmin >
    // ===END_RETURN===
  )
}
