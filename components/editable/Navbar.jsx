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
import { MdBorderColor } from "react-icons/md";
import SearchBar from "./SearchBar";
import { useBranding } from "@/hooks/useBranding";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [onClick, setOnClick] = useState(false);
  const { logo, palette, loading } = useBranding();

  // Estado para manejar hover dinámico
  const [hoveredItem, setHoveredItem] = useState(null);

  function handleClick() {
    setIsOpen(!isOpen);
  }

  function Open() {
    setOnClick(prev => !prev);
  }

  function urlClass(href) {
    return pathname === href
      ? `bg-[${palette[5]}]`
      : "bg-slate-700";
  }

  function urlClass2(href) {
    return pathname === href ? "bg-slate-700" : "";
  }

  // Retorna estilo inline para color hover
  function getHoverStyle(key) {
    return hoveredItem === key ? { color: palette[0] } : {};
  }

  // Retorna estilo inline para border hover
  function getHoverBorderStyle(key) {
    return hoveredItem === key
      ? { borderColor: palette[0], borderWidth: "1px", borderStyle: "solid" }
      : {};
  }

  if (status === "loading" || loading) {
    return <Loading zIndex={50} />;
  }

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
              <TiThMenu
                className={`w-4 h-4 ${isOpen ? "hidden" : ""}`}
                cursor="pointer"
                style={getHoverStyle("menuIcon")}
                onMouseEnter={() => setHoveredItem("menuIcon")}
                onMouseLeave={() => setHoveredItem(null)}
              />
              <TiTimes
                className={`w-4 h-4 ${isOpen ? "" : "hidden"}`}
                cursor="pointer"
                style={getHoverStyle("menuIcon")}
                onMouseEnter={() => setHoveredItem("menuIcon")}
                onMouseLeave={() => setHoveredItem(null)}
              />
              <div
                className={`menu bg-slate-500 text-2xl grid grid-cols-1 gap-1 absolute left-5 top-5 p-1 rounded-xl z-20 ${
                  isOpen ? "" : "hidden"
                }`}
              >
                <Link
                  href="/"
                  onMouseEnter={() => setHoveredItem("home")}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={getHoverStyle("home")}
                >
                  <p className={`${urlClass("/")} rounded-xl px-2 flex justify-center items-center`}>
                    Inicio <FaBookOpen className="ml-1" />
                  </p>
                </Link>
                <Link
                  href="/products"
                  onMouseEnter={() => setHoveredItem("products")}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={getHoverStyle("products")}
                >
                  <p className={`${urlClass("/products")} rounded-xl px-2 flex justify-center items-center`}>
                    Productos <IoLogoOctocat className="ml-1" />
                  </p>
                </Link>
                <Link
                  href="/wishlist"
                  className="max-[420px]:block hidden"
                  onMouseEnter={() => setHoveredItem("wishlistMobile")}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={getHoverStyle("wishlistMobile")}
                >
                  <p className={`${urlClass("/wishlist")} rounded-xl px-2 flex justify-center items-center`}>
                    Favoritos <IoIosHeart className="ml-1" />
                  </p>
                </Link>
                <Link
                  href="/cart"
                  className="max-[420px]:block hidden"
                  onMouseEnter={() => setHoveredItem("cartMobile")}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={getHoverStyle("cartMobile")}
                >
                  <p className={`${urlClass("/cart")} rounded-xl px-2 flex justify-center items-center`}>
                    Carrito <FaCartShopping className="ml-1" />
                  </p>
                </Link>
                <Link
                  href="/orders"
                  onMouseEnter={() => setHoveredItem("orders")}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={getHoverStyle("orders")}
                >
                  <p className={`${urlClass("/orders")} rounded-xl px-2 flex justify-center items-center`}>
                    Pedidos <MdBorderColor className="ml-1" />
                  </p>
                </Link>
                <Link
                  href="/profile"
                  onMouseEnter={() => setHoveredItem("profile")}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={getHoverStyle("profile")}
                >
                  <p className={`${urlClass("/profile")} rounded-xl px-2 flex justify-center items-center`}>
                    Perfil <IoPersonSharp className="ml-1" />
                  </p>
                </Link>
                <button
                  className="bg-slate-700 rounded-xl px-2 flex justify-center items-center"
                  onClick={() =>
                    signOut({
                      callbackUrl: "/",
                    })
                  }
                  onMouseEnter={() => setHoveredItem("logout")}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={getHoverStyle("logout")}
                >
                  Cerrar Sesión <FaSignOutAlt className="ml-1" />
                </button>
              </div>
            </div>

            <Link
              href="/wishlist"
              className="text-sm max-[420px]:hidden col-start-2 col-end-3 block"
            >
              <p
                className={`${urlClass2("/wishlist")} rounded-xl`}
                onMouseEnter={() => setHoveredItem("wishlist")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...getHoverStyle("wishlist"),
                  ...getHoverBorderStyle("wishlist"),
                }}
              >
                Favoritos <IoIosHeart className="m-auto w-4 h-4" />
              </p>
            </Link>

            <Link
              href="/cart"
              className="text-sm max-[420px]:hidden col-start-3 col-end-4 block"
            >
              <p
                className={`${urlClass2("/cart")} rounded-xl w-4/5`}
                onMouseEnter={() => setHoveredItem("cart")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...getHoverStyle("cart"),
                  ...getHoverBorderStyle("cart"),
                }}
              >
                Carrito <FaCartShopping className="m-auto w-4 h-4" />
              </p>
            </Link>
          </>
        ) : (
          <button
            className="max-[420px]:text-sm text-2xl col-start-1 max-[420px]:col-end-2 col-end-3 flex justify-center items-center"
            onClick={() => signIn()}
            onMouseEnter={() => setHoveredItem("signIn")}
            onMouseLeave={() => setHoveredItem(null)}
            style={getHoverStyle("signIn")}
          >
            <p
              className="max-[420px]:leading-3 leading-6 rounded-xl"
              style={getHoverBorderStyle("signIn")}
            >
              Iniciar Sesión
            </p>
            <FaSignInAlt className="m-auto w-4 h-4 max-[420px]:hidden" />
          </button>
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
            {["Admin", "Desarrollador", "Vendedor", "Delivery"].includes(session.user.role) ? (
              <div
                className="bg-slate-600 text-4xl py-0.5 pl-1 pr-0.5 rounded-full shadow-6xl w-6 h-6"
                onMouseEnter={() => setHoveredItem("adminIcon")}
                onMouseLeave={() => setHoveredItem(null)}
                style={getHoverStyle("adminIcon")}
              >
                <Link href="/admin">
                  <MdAdminPanelSettings />
                </Link>
              </div>
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
            <button
              onClick={Open}
              onMouseEnter={() => setHoveredItem("search")}
              onMouseLeave={() => setHoveredItem(null)}
              style={getHoverStyle("search")}
            >
              <PiMagnifyingGlassBold className="w-4 h-4" />
            </button>
          </div>
        )}
      </nav>
      <div className="h-9" />
    </DoNotShowAdmin>
    // ===END_RETURN===
  );
}
