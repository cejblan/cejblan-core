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
import { IoPersonSharp } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaShoppingBag, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import DoNotShowAdmin from "@/app/admin/components/DoNotShowAdmin";
import SearchBar from "./SearchBar";
import { useBranding } from "@/hooks/useBranding";
import { Hoverable } from "@/hooks/hoverable";
import { MdBorderColor } from "react-icons/md";
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

export default function Navbar1() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [onClick, setOnClick] = useState(false);
  const Loading = getLoadingComponent(branding.loading);
  const { logo3, palette, loading } = useBranding();

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
              {/* Íconos burger */}
              <Hoverable
                as={TiThMenu}
                className={`w-4 h-4 ${isOpen ? "hidden" : ""}`}
                hoverStyle={{ fill: palette[5] }}
                cursor="pointer"
              />
              <Hoverable
                as={TiTimes}
                className={`w-4 h-4 ${isOpen ? "" : "hidden"}`}
                hoverStyle={{ fill: palette[5] }}
                cursor="pointer"
              />

              {/* Menú desplegable */}
              <div
                className="menu text-2xl grid grid-cols-1 gap-1 absolute left-5 top-5 p-1 rounded-xl z-20"
                style={{
                  backgroundColor: palette[3],
                  ...(isOpen ? {} : { display: "none" })
                }}
              >
                {[
                  { href: "/", label: "Inicio", icon: <FaBookOpen /> },
                  { href: "/products", label: "Productos", icon: <FaShoppingBag /> },
                  { href: "/wishlist", label: "Favoritos", icon: <IoIosHeart />, mobileOnly: true },
                  { href: "/cart", label: "Carrito", icon: <FaCartShopping />, mobileOnly: true },
                  { href: "/orders", label: "Pedidos", icon: <MdBorderColor /> },
                  { href: "/profile", label: "Perfil", icon: <IoPersonSharp /> },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={item.mobileOnly ? "max-[420px]:block hidden" : ""}
                  >
                    <Hoverable
                      as="p"
                      className="rounded-xl px-2 flex justify-center items-center"
                      style={urlStyle(item.href)}
                      hoverStyle={{ color: palette[0] }}
                    >
                      {item.label} <span className="ml-1">{item.icon}</span>
                    </Hoverable>
                  </Link>
                ))}

                <Hoverable
                  as="button"
                  className="rounded-xl px-2 flex justify-center items-center"
                  style={urlStyle("/signout")}
                  hoverStyle={{ color: palette[0] }}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Cerrar Sesión <FaSignOutAlt className="ml-1" />
                </Hoverable>
              </div>
            </div>

            {/* Favoritos (desktop) */}
            <Link href="/wishlist" className="text-sm max-[420px]:hidden col-start-2 col-end-3 block">
              <Hoverable
                as="p"
                className="rounded-xl"
                style={urlStyleActive("/wishlist")}
                hoverStyle={{ color: palette[0], borderColor: palette[0] }}
              >
                Favoritos <IoIosHeart className="m-auto w-4 h-4" />
              </Hoverable>
            </Link>

            {/* Carrito (desktop) */}
            <Link href="/cart" className="text-sm max-[420px]:hidden col-start-3 col-end-4 block">
              <Hoverable
                as="p"
                className="rounded-xl w-4/5"
                style={urlStyleActive("/cart")}
                hoverStyle={{ color: palette[0], borderColor: palette[0] }}
              >
                Carrito <FaCartShopping className="m-auto w-4 h-4" />
              </Hoverable>
            </Link>
          </>
        ) : (
          <Hoverable
            as="button"
            className="max-[420px]:text-sm text-2xl col-start-1 max-[420px]:col-end-2 col-end-3 flex justify-center items-center"
            hoverStyle={{ color: palette[0], borderColor: palette[0] }}
            onClick={() => signIn()}
          >
            <p className="max-[420px]:leading-3 leading-6 rounded-xl">Iniciar Sesión</p>
            <FaSignInAlt className="m-auto w-4 h-4 max-[420px]:hidden" />
          </Hoverable>
        )}

        {/* Logo */}
        <Link href="/" className="max-[420px]:col-start-2 max-[420px]:col-end-6 col-start-5 col-end-9 z-10">
          <div className="flex">
            {logo3 && (
              <Image
                className="m-auto w-auto"
                src={logo3}
                alt={`Logo ${process.env.NEXT_PUBLIC_SITE_NAME}`}
                width={100}
                height={100}
              />
            )}
          </div>
        </Link>

        {session?.user ? (
          <div className="max-[420px]:m-auto max-[420px]:col-start-6 max-[420px]:col-end-6 col-start-10 col-end-13 flex justify-end items-center">
            <span className="text-lg max-[420px]:hidden mr-1">¡Hola, {session.user.name}!</span>

            {["Admin", "Desarrollador", "Vendedor", "Delivery"].includes(session.user.role) ? (
              <Hoverable
                as="div"
                className="text-4xl py-0.5 pl-1 pr-0.5 rounded-full shadow-6xl w-6 h-6"
                style={{ backgroundColor: palette[4] }}
                hoverStyle={{ backgroundColor: palette[3] }}
              >
                <Link href="/admin">
                  <MdAdminPanelSettings />
                </Link>
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
          <div className="max-[420px]:m-auto max-[420px]:col-start-6 max-[420px]:col-end-6 col-start-10 col-end-13 flex justify-end items-center">
            {onClick && <SearchBar />}
            <Hoverable
              as="button"
              hoverStyle={{ fill: palette[0] }}
              onClick={Open}
            >
              <PiMagnifyingGlassBold className="w-4 h-4" />
            </Hoverable>
          </div>
        )}
      </nav>
      <div className="h-9" />
    </DoNotShowAdmin>
    // ===END_RETURN===
  );
}
