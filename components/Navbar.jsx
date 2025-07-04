"use client"

import { usePathname } from "next/navigation";
import { signIn, useSession, signOut } from "next-auth/react";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "public/nuevo_logo_cejblan2.webp"
import { TiThMenu, TiTimes } from "react-icons/ti";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { FaCartShopping, FaBookOpen } from "react-icons/fa6";
import { IoIosHeart } from "react-icons/io";
import { IoLogoOctocat, IoPersonSharp } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import Loading from "./Loading";
import DoNotShowAdmin from "../admin/components/DoNotShowAdmin";
import { MdBorderColor } from "react-icons/md";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [onClick, setOnClick] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  function Open() {
    if (onClick) {
      setOnClick(false)
    } else if (!onClick) {
      setOnClick(true)
    }
  }

  function urlClass(href) {
    if (pathname === href) {
      return (
        "bg-[#0A192F]"
      );
    } else {
      return (
        "bg-slate-700"
      );
    };
  };

  function urlClass2(href) {
    if (pathname === href) {
      return (
        "bg-slate-700"
      );
    };
  };

  if (status === "loading") {
    return (
      <Loading zIndex={50} />
    );
  };

  return (
    <DoNotShowAdmin>
      <nav id="navCejblan" className="bg-gradient-to-b from-[#0A192F] to-[#64FFDA] text-[#F8F8F8] text-xl font-bold justify-center items-center grid max-[420px]:grid-cols-6 grid-cols-12 gap-1 py-1 px-2 shadow-8xl h-9 w-full z-30 fixed">
        {session?.user ?
          <>
            <div className={`burger max-[420px]:m-auto col-start-1 col-end-1 justify-center items-center ${isOpen ? "open" : ""}`} onClick={handleClick}>
              <TiThMenu className={`w-4 h-4 hover:fill-slate-800 ${isOpen ? "hidden" : ""}`} cursor="pointer" />
              <TiTimes className={`w-4 h-4 hover:fill-slate-800 ${isOpen ? "" : "hidden"}`} cursor="pointer" />
              <div className="menu bg-slate-500 text-2xl grid grid-cols-1 gap-1 gap-white absolute left-5 top-5 p-1 rounded-xl z-20">
                <Link href="/" className="hover:text-[#64FFDA]">
                  <p className={`${urlClass("/")} rounded-xl px-2 flex justify-center items-center`}>
                    Inicio
                    <FaBookOpen className="ml-1" />
                  </p>
                </Link>
                <Link href="/products" className="hover:text-[#64FFDA]">
                  <p className={`${urlClass("/products")} rounded-xl px-2 flex justify-center items-center`}>
                    Productos
                    <IoLogoOctocat className="ml-1" />
                  </p>
                </Link>
                <Link href="/wishlist" className="hover:text-[#64FFDA] max-[420px]:block hidden">
                  <p className={`${urlClass("/wishlist")} rounded-xl px-2 flex justify-center items-center`}>
                    Favoritos
                    <IoIosHeart className="ml-1" />
                  </p>
                </Link>
                <Link href="/cart" className="hover:text-[#64FFDA] max-[420px]:block hidden">
                  <p className={`${urlClass("/cart")} rounded-xl px-2 flex justify-center items-center`}>
                    Carrito
                    <FaCartShopping className="ml-1" />
                  </p>
                </Link>
                <Link href="/orders" className="hover:text-[#64FFDA]">
                  <p className={`${urlClass("/orders")} rounded-xl px-2 flex justify-center items-center`}>
                    Pedidos
                    <MdBorderColor className="ml-1" />
                  </p>
                </Link>
                <Link href="/profile" className="hover:text-[#64FFDA]">
                  <p className={`${urlClass("/profile")} rounded-xl px-2 flex justify-center items-center`}>
                    Perfil
                    <IoPersonSharp className="ml-1" />
                  </p>
                </Link>
                <button
                  className="hover:text-[#64FFDA] bg-slate-700 rounded-xl px-2 flex justify-center items-center"
                  onClick={() => signOut({
                    callbackUrl: "/",
                  })}
                >
                  Cerrar Sesión <FaSignOutAlt className="ml-1" />
                </button>
              </div>
            </div>
            <Link href="/wishlist" className="hover:text-[#64FFDA] text-sm max-[420px]:hidden col-start-2 col-end-3 block">
              <p className={`${urlClass2("/wishlist")} hover:border-[#64FFDA] rounded-xl`}>
                Favoritos
                <IoIosHeart className="m-auto w-4 h-4" />
              </p>
            </Link>
            <Link href="/cart" className="hover:text-[#64FFDA] text-sm max-[420px]:hidden col-start-3 col-end-4 block">
              <p className={`${urlClass2("/cart")} hover:border-[#64FFDA] rounded-xl w-4/5`}>
                Carrito
                <FaCartShopping className="m-auto w-4 h-4" />
              </p>
            </Link>
          </>
          :
          <button
            className="hover:text-[#64FFDA] max-[420px]:text-sm text-2xl col-start-1 max-[420px]:col-end-2 col-end-3 flex justify-center items-center"
            onClick={() => signIn()}
          >
            <p className="hover:border-[#64FFDA] max-[420px]:leading-3 leading-6 rounded-xl">Iniciar Sesión</p>
            <FaSignInAlt className="m-auto w-4 h-4 max-[420px]:hidden" />
          </button>
        }
        <Link href="/" className="max-[420px]:col-start-2 max-[420px]:col-end-6 col-start-5 col-end-9 z-10">
          <div className="flex">
            <Image className="m-auto max-[420px]:w-full w-3/5 h-3/5" src={Logo} alt="Logo Cejblan" width={200} height={200} />
          </div>
        </Link>
        {session?.user ? (
          <div className="max-[420px]:m-auto max-[420px]:col-start-6 max-[420px]:col-end-6 col-start-10 col-end-13 flex max-[420px]:justify-center justify-end items-center">
            <span className="text-lg max-[420px]:hidden mr-1">¡Hola, {session?.user.name}!</span>
            {session?.user.admin ? (
              <div className="hover:bg-slate-500 bg-slate-600 text-4xl py-0.5 pl-1 pr-0.5 rounded-full shadow-6xl w-6 h-6">
                <Link href="/admin">
                  <MdAdminPanelSettings />
                </Link>
              </div>
            ) : (
              <Link href="/profile">
                <Image src={session?.user.image}
                  alt="Imagen de Usuario"
                  className="rounded-full w-6 h-6"
                  width={100} height={100} />
              </Link>
            )}
          </div>
        ) : (
          <div className="max-[420px]:m-auto max-[420px]:col-start-6 max-[420px]:col-end-6 col-start-10 col-end-13 flex max-[420px]:justify-center justify-end items-center">
            {onClick &&
              <SearchBar />
            }
            <button
              onClick={Open}
            >
              <PiMagnifyingGlassBold className="w-4 h-4 hover:fill-[#64FFDA]" />
            </button>
          </div>
        )}
      </nav>
      <div className="h-9" />
    </DoNotShowAdmin>
  )
}