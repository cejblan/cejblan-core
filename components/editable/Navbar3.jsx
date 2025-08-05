"use client"

import { usePathname } from "next/navigation";
import { signIn, useSession, signOut } from "next-auth/react";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TiThMenu, TiTimes } from "react-icons/ti";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { FaCartShopping, FaBookOpen } from "react-icons/fa6";
import { IoIosHeart } from "react-icons/io";
import { IoLogoOctocat, IoPersonSharp } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import Loading from "./Loading";
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin";
import SearchBar from "./SearchBar";
import { useBranding } from "@/hooks/useBranding";
import { Hoverable } from "@/hooks/hoverable";
import { MdBorderColor } from "react-icons/md";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [onClick, setOnClick] = useState(false);
  const { logo, palette, loading } = useBranding();

  const handleClick = () => setIsOpen(prev => !prev);
  const Open = () => setOnClick(prev => !prev);

  function urlStyle(href) {
    return { backgroundColor: pathname === href ? palette[5] : palette[4] };
  }
  function urlStyleActive(href) {
    return pathname === href ? { backgroundColor: palette[5] } : {};
  }

  if (status === "loading" || loading) return <Loading zIndex={50} />;

  return (
    // ===START_RETURN===
    <DoNotShowAdmin>
      <nav
        id="navAdmin"
        className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-2 grid grid-cols-12 items-center shadow-2xl backdrop-blur-md transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${palette[5]}cc, ${palette[0]}cc)`,
          color: palette[6],
          borderBottom: `1px solid ${palette[4]}99`,
        }}
      >
        {/* Menú hamburguesa + desplegable */}
        {session?.user && (
          <div
            className="col-start-1 flex items-center justify-center"
            onClick={handleClick}
          >
            <Hoverable
              as={isOpen ? TiTimes : TiThMenu}
              className="w-6 h-6 cursor-pointer transition-transform duration-200 hover:scale-110"
              hoverStyle={{ fill: palette[0] }}
            />
            {isOpen && (
              <div
                className="absolute top-10 left-4 z-40 w-52 p-2 rounded-xl shadow-lg border"
                style={{
                  backgroundColor: `${palette[3]}`,
                  borderColor: palette[2],
                }}
              >
                {[
                  { href: "/", label: "Inicio", icon: <FaBookOpen /> },
                  { href: "/products", label: "Productos", icon: <IoLogoOctocat /> },
                  { href: "/wishlist", label: "Favoritos", icon: <IoIosHeart /> },
                  { href: "/cart", label: "Carrito", icon: <FaCartShopping /> },
                  { href: "/orders", label: "Pedidos", icon: <MdBorderColor /> },
                  { href: "/profile", label: "Perfil", icon: <IoPersonSharp /> },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Hoverable
                      as="div"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm"
                      style={urlStyle(item.href)}
                      hoverStyle={{
                        color: palette[0],
                        textShadow: `0 0 3px ${palette[0]}`,
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Hoverable>
                  </Link>
                ))}

                <Hoverable
                  as="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="mt-2 flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm"
                  style={{ backgroundColor: palette[2] }}
                  hoverStyle={{
                    color: palette[0],
                    textShadow: `0 0 3px ${palette[0]}`,
                  }}
                >
                  <FaSignOutAlt />
                  Cerrar sesión
                </Hoverable>
              </div>
            )}
          </div>
        )}

        {/* Logo central */}
        <Link href="/" className="col-start-5 col-end-9 text-center">
          {logo && (
            <Image
              src={logo}
              alt="Logo"
              width={160}
              height={160}
              className="mx-auto w-32 h-auto object-contain"
            />
          )}
        </Link>

        {/* Acciones del lado derecho */}
        <div className="col-start-10 col-end-13 flex justify-end items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/wishlist" className="hidden sm:flex">
                <Hoverable
                  as="div"
                  className="p-1 rounded-full"
                  style={urlStyleActive("/wishlist")}
                  hoverStyle={{
                    color: palette[0],
                    textShadow: `0 0 3px ${palette[0]}`,
                  }}
                >
                  <IoIosHeart />
                </Hoverable>
              </Link>
              <Link href="/cart" className="hidden sm:flex">
                <Hoverable
                  as="div"
                  className="p-1 rounded-full"
                  style={urlStyleActive("/cart")}
                  hoverStyle={{
                    color: palette[0],
                    textShadow: `0 0 3px ${palette[0]}`,
                  }}
                >
                  <FaCartShopping />
                </Hoverable>
              </Link>
              <span className="hidden md:inline text-sm mr-1">
                ¡Hola, {session.user.name}!
              </span>
              {["Admin", "Desarrollador", "Vendedor", "Delivery"].includes(session.user.role) ? (
                <Link href="/admin">
                  <Hoverable
                    as="div"
                    className="p-1 rounded-full shadow-md"
                    style={{ backgroundColor: palette[4] }}
                    hoverStyle={{ backgroundColor: palette[3] }}
                  >
                    <MdAdminPanelSettings className="w-5 h-5" />
                  </Hoverable>
                </Link>
              ) : (
                <Link href="/profile">
                  <Image
                    src={session.user.image}
                    alt="Usuario"
                    width={30}
                    height={30}
                    className="rounded-full border border-white"
                  />
                </Link>
              )}
            </>
          ) : (
            <>
              {onClick && <SearchBar />}
              <Hoverable
                as="button"
                onClick={Open}
                hoverStyle={{ fill: palette[0] }}
              >
                <PiMagnifyingGlassBold className="w-5 h-5" />
              </Hoverable>
              <Hoverable
                as="button"
                onClick={() => signIn()}
                className="flex items-center gap-1 text-sm"
                hoverStyle={{ color: palette[0] }}
              >
                Iniciar sesión <FaSignInAlt className="w-4 h-4" />
              </Hoverable>
            </>
          )}
        </div>
      </nav>
      <div className="h-12" />
    </DoNotShowAdmin>
    // ===END_RETURN===
  );
}
