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

export default function Navbar() {
  // Hooks de Navbar (cantidad y orden fijos)
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [onClick, setOnClick] = useState(false);
  const { logo, palette, loading } = useBranding();

  function handleClick() {
    setIsOpen(prev => !prev);
  }
  function Open() {
    setOnClick(prev => !prev);
  }
  function urlStyle(href) {
    return { backgroundColor: pathname === href ? palette[5] : palette[4] };
  }
  function urlStyleActive(href) {
    return pathname === href ? { backgroundColor: 'rgb(51 65 85)' } : {};
  }

  if (status === "loading" || loading) {
    return <Loading zIndex={50} />;
  }

  // ===START_RETURN===
  return (
    <DoNotShowAdmin>
      <nav
        id="navAdmin"
        className="text-xl font-bold justify-center items-center grid max-[420px]:grid-cols-6 grid-cols-12 gap-1 py-1 px-2 shadow-8xl h-9 w-full z-30 fixed"
        style={{
          background: `linear-gradient(to bottom, ${palette[5]}, ${palette[0]})`,
          color: palette[6],
        }}
      >
        {session?.user ? (
          <>
            <div
              className="burger max-[420px]:m-auto col-start-1 col-end-1 justify-center items-center"
              onClick={handleClick}
            >
              <Hoverable
                as={TiThMenu}
                hoverColor={palette[0]}
                className={`w-4 h-4 ${isOpen ? "hidden" : ""}`}
                cursor="pointer"
              />
              <Hoverable
                as={TiTimes}
                hoverColor={palette[0]}
                className={`w-4 h-4 ${isOpen ? "" : "hidden"}`}
                cursor="pointer"
              />
              <div
                className={`menu bg-slate-500 text-2xl grid grid-cols-1 gap-1 absolute left-5 top-5 p-1 rounded-xl z-20 ${isOpen ? "" : "hidden"}`}
              >
                {[
                  { href: "/", label: "Inicio", icon: <FaBookOpen /> },
                  { href: "/products", label: "Productos", icon: <IoLogoOctocat /> },
                  { href: "/wishlist", label: "Favoritos", icon: <IoIosHeart />, mobileOnly: true },
                  { href: "/cart", label: "Carrito", icon: <FaCartShopping />, mobileOnly: true },
                  { href: "/orders", label: "Pedidos", icon: null },
                  { href: "/profile", label: "Perfil", icon: <IoPersonSharp /> },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={item.mobileOnly ? "max-[420px]:block hidden" : ""}
                  >
                    <Hoverable
                      as="p"
                      hoverColor={palette[0]}
                      className="rounded-xl px-2 flex justify-center items-center"
                      style={urlStyle(item.href)}
                    >
                      {item.label} {item.icon && <span className="ml-1">{item.icon}</span>}
                    </Hoverable>
                  </Link>
                ))}
                <Hoverable
                  as="button"
                  hoverColor={palette[0]}
                  className="rounded-xl px-2 flex justify-center items-center"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={urlStyle("/signout")}
                >
                  Cerrar Sesión <FaSignOutAlt className="ml-1" />
                </Hoverable>
              </div>
            </div>

            <Link href="/wishlist" className="text-sm max-[420px]:hidden col-start-2 col-end-3 block">
              <Hoverable
                as="p"
                hoverColor={palette[0]}
                className="rounded-xl"
                style={urlStyleActive("/wishlist")}
              >
                Favoritos <IoIosHeart className="m-auto w-4 h-4"/>
              </Hoverable>
            </Link>

            <Link href="/cart" className="text-sm max-[420px]:hidden col-start-3 col-end-4 block">
              <Hoverable
                as="p"
                hoverColor={palette[0]}
                className="rounded-xl w-4/5"
                style={urlStyleActive("/cart")}
              >
                Carrito <FaCartShopping className="m-auto w-4 h-4"/>
              </Hoverable>
            </Link>
          </>
        ) : (
          <Hoverable
            as="button"
            hoverColor={palette[0]}
            className="max-[420px]:text-sm text-2xl col-start-1 max-[420px]:col-end-2 col-end-3 flex justify-center items-center"
            onClick={() => signIn()}
          >
            <p className="max-[420px]:leading-3 leading-6 rounded-xl">Iniciar Sesión</p>
            <FaSignInAlt className="m-auto w-4 h-4 max-[420px]:hidden"/>
          </Hoverable>
        )}

        <Link href="/" className="max-[420px]:col-start-2 max-[420px]:col-end-6 col-start-5 col-end-9 z-10">
          <div className="flex">
            {logo && (
              <Image
                className="m-auto max-[420px]:w-full w-3/5 h-3/5"
                src={logo}
                alt={`Logo ${process.env.NEXT_PUBLIC_SITE_NAME}`}
                width={200}
                height={200}
              />
            )}
          </div>
        </Link>

        {session?.user ? (
          <div className="max-[420px]:m-auto max-[420px]:col-start-6 max-[420px]:col-end-6 col-start-10 col-end-13 flex max-[420px]:justify-center justify-end items-center">
            <span className="text-lg max-[420px]:hidden mr-1">¡Hola, {session.user.name}!</span>
            {["Admin","Desarrollador","Vendedor","Delivery"].includes(session.user.role) ? (
              <Hoverable
                as="div"
                hoverColor={palette[0]}
                className="bg-slate-600 text-4xl py-0.5 pl-1 pr-0.5 rounded-full shadow-6xl w-6 h-6"
              >
                <Link href="/admin"><MdAdminPanelSettings/></Link>
              </Hoverable>
            ) : (
              <Link href="/profile">
                <Image
                  src={session.user.image}
                  alt="Imagen de Usuario"
                  className="rounded-full w-6 h-6"
                  width={100}
                  height={100}
                />
              </Link>
            )}
          </div>
        ) : (
          <div className="max-[420px]:m-auto max-[420px]:col-start-6 max-[420px]:col-end-6 col-start-10 col-end-13 flex max-[420px]:justify-center justify-end items-center">
            {onClick && <SearchBar />}
            <Hoverable
              as="button"
              hoverColor={palette[0]}
              onClick={Open}
            >
              <PiMagnifyingGlassBold className="w-4 h-4" />
            </Hoverable>
          </div>
        )}
      </nav>
      <div className="h-9" />
    </DoNotShowAdmin>
  );
  // ===END_RETURN===
}
