"use client"

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { FaHome } from "react-icons/fa";
import { AiFillDashboard, AiFillShopping } from "react-icons/ai";
import { IoPersonSharp } from "react-icons/io5";
import { FaPlus, FaSignOutAlt, FaTelegram } from "react-icons/fa";
import { TiThMenu, TiTimes } from "react-icons/ti";
import { VscTriangleLeft } from "react-icons/vsc";
import { MdCategory, MdDeliveryDining, MdBorderColor } from "react-icons/md";
import { PiBlueprintFill } from "react-icons/pi";
import { PiCoinsFill } from "react-icons/pi";
import { PiCurrencyDollarSimpleFill } from "react-icons/pi";
import { RiPaintBrushFill } from "react-icons/ri";
import Image from "next/image";
import Loading from "../../components/Loading";
import Link from "next/link";

export default function NavbarAdmin({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTwo, setIsOpenTwo] = useState(false);
  const [isOpenThree, setIsOpenThree] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const tablero = "/admin";
  const users = "/admin/users";
  const usersId = /\/admin\/users\/?/;
  const usersIdVerified = usersId.test(pathname);
  const newUsers = "/admin/users/new";
  const products = "/admin/products";
  const productsId = /\/admin\/products\/?/;
  const productsIdVerified = productsId.test(pathname);
  const newProduct = "/admin/products/new";
  const categories = "/admin/categories";
  const newCategory = "/admin/categories/new";
  const payments = "/admin/payments";
  const newPay = "/admin/payments/new";
  const deliveries = "/admin/deliveries";
  const newDelivery = "/admin/deliveries/new";
  const orders = "/admin/orders";
  const deliveryNote = "/admin/deliveryNote";
  const coins = "/admin/coins";
  const telegram = "/admin/telegram";
  const appearance = "/admin/appearance";
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  const handleClickTwo = () => {
    setIsOpenTwo(!isOpenTwo);
  };
  const handleClickThree = () => {
    setIsOpenThree(!isOpenThree);
  };
  
  function urlClass(href) {
    if (pathname === href || href === true) {
      return "bg-slate-700";
    } else {
      return null;
    };
  };

  function urlIcon(href) {
    if (pathname === href || href === true) {
      return null;
    } else {
      return "hidden";
    };
  };
  
  if (status === "loading") {
    return (
      <Loading zIndex={50} />
    );
  };

  return (
    <>
      <nav id="navCejblanAdmin" className="text-white text-base h-5 w-full fixed z-20">
        <div className="bg-slate-800 w-full flex items-center">
          <div className={`max-[420px]:m-auto ${isOpen ? "open" : ""}`} onClick={handleClick}>
            <TiThMenu className={`hover:fill-slate-500 w-4 h-4 ${isOpen ? "hidden" : "md:hidden"}`} cursor="pointer" />
            <TiTimes className={`hover:fill-slate-500 w-4 h-4 ${isOpen ? "md:hidden" : "hidden"}`} cursor="pointer" />
          </div>
          <Link href="/" className="hover:bg-slate-700 hover:text-blue-300 p-1 flex items-center">
            <FaHome className="mr-1 w-3 h-3" />
            <h1 className="font-bold max-[420px]:hidden">CejblanShop</h1>
          </Link>
          <div className={`burger max-[420px]:m-auto flex justify-center items-center relative ${isOpenTwo ? "open" : ""}`} onClick={handleClickTwo}>
            <FaPlus className={`hover:fill-slate-500 w-3 h-3 ${isOpenTwo ? "hidden" : "md:hidden"}`} cursor="pointer" />
            <FaPlus className={`hover:fill-slate-500 w-3 h-3 ${isOpenTwo ? "md:hidden" : "hidden"} transform rotate-45`} cursor="pointer" />
            <div className="menu bg-slate-700 rounded-xl absolute top-0 left-5">
              <Link href={newUsers} className={`${urlClass(newUsers)} hover:bg-slate-600 hover:text-blue-300 p-1 flex items-center`}>
                <FaPlus className="mr-1 w-2 h-2" />
                <h2 className="w-max">Usuario</h2>
              </Link>
              <Link href={newProduct} className={`${urlClass(newProduct)} hover:bg-slate-600 hover:text-blue-300 p-1 flex items-center`}>
                <FaPlus className="mr-1 w-2 h-2" />
                <h2 className="w-max">Producto</h2>
              </Link>
              <Link href={newCategory} className={`${urlClass(newCategory)} hover:bg-slate-600 hover:text-blue-300 p-1 flex items-center`}>
                <FaPlus className="mr-1 w-2 h-2" />
                <h2 className="w-max">Categoría</h2>
              </Link>
              <Link href={newPay} className={`${urlClass(newPay)} hover:bg-slate-600 hover:text-blue-300 p-1 flex items-center`}>
                <FaPlus className="mr-1 w-2 h-2" />
                <h2 className="w-max">Forma de Pago</h2>
              </Link>
              <Link href={newDelivery} className={`${urlClass(newDelivery)} hover:bg-slate-600 hover:text-blue-300 p-1 flex items-center`}>
                <FaPlus className="mr-1 w-2 h-2" />
                <h2 className="w-max">Forma de Entrega</h2>
              </Link>
            </div>
          </div>
          <Link href={newUsers} className={`${urlClass(newUsers)} hover:bg-slate-700 hover:text-blue-300 p-1 flex max-[420px]:hidden items-center`}>
            <FaPlus className="mr-1 w-2 h-2" />
            <h2>Usuario</h2>
          </Link>
          <Link href={newProduct} className={`${urlClass(newProduct)} hover:bg-slate-700 hover:text-blue-300 p-1 flex max-[420px]:hidden items-center`}>
            <FaPlus className="mr-1 w-2 h-2" />
            <h2>Producto</h2>
          </Link>
          <Link href={newCategory} className={`${urlClass(newCategory)} hover:bg-slate-700 hover:text-blue-300 p-1 flex max-[420px]:hidden items-center`}>
            <FaPlus className="mr-1 w-2 h-2" />
            <h2>Categoría</h2>
          </Link>
          <Link href={newPay} className={`${urlClass(newPay)} hover:bg-slate-700 hover:text-blue-300 p-1 flex max-[420px]:hidden items-center`}>
            <FaPlus className="mr-1 w-2 h-2" />
            <h2>Forma de Pago</h2>
          </Link>
          <Link href={newDelivery} className={`${urlClass(newDelivery)} hover:bg-slate-700 hover:text-blue-300 p-1 flex max-[420px]:hidden items-center`}>
            <FaPlus className="mr-1 w-2 h-2" />
            <h2>Forma de Entrega</h2>
          </Link>
          <div className="hover:text-blue-300 p-1 ml-auto max-[420px]:w-full flex justify-end items-center relative" onClick={handleClickThree}>
            <h2 className="max-[420px]:text-xs mr-1">{session?.user.name}</h2>
            <Image src={session?.user.image}
              alt="Imagen de Usuario"
              className="w-3 h-3 rounded-full cursor-pointer"
              width={100} height={100} />
            <button
              className={`bg-slate-700 hover:bg-slate-600 py-1 px-2 rounded-b-xl w-max absolute top-5 right-0 flex justify-center items-center ${isOpenThree ? "" : "hidden"}`}
              onClick={() => signOut({
                callbackUrl: "/",
              })}>
              Cerrar Sesión <FaSignOutAlt className="ml-1" />
            </button>
          </div>
        </div>
      </nav>
      <div className="pt-5 flex">
        <div className={`bg-slate-800 max-[420px]:text-sm text-white text-left h-screen max-[420px]:min-w-16 min-w-48 grid grid-cols-1 auto-rows-min fixed ${isOpen ? "" : "max-[420px]:hidden"}`}>
          <Link href={tablero} className={`${urlClass(tablero)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-y border-slate-600 flex items-center`}>
            <AiFillDashboard className="mr-1 w-2 h-2" />
            <h2>Tablero</h2>
            <VscTriangleLeft className={`${urlIcon(tablero)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={users} className={`${urlClass(usersIdVerified || users)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <IoPersonSharp className="mr-1 w-2 h-2" />
            <h3>Usuarios</h3>
            <VscTriangleLeft className={`${urlIcon(usersIdVerified || users)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={products} className={`${urlClass(productsIdVerified || products)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <AiFillShopping className="mr-1 w-2 h-2" />
            <h3>Productos</h3>
            <VscTriangleLeft className={`${urlIcon(productsIdVerified || products)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={categories} className={`${urlClass(categories)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <MdCategory className="mr-1 w-2 h-2" />
            <h3>Categorías</h3>
            <VscTriangleLeft className={`${urlIcon(categories)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={payments} className={`${urlClass(payments)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <PiCurrencyDollarSimpleFill className="mr-1 w-2 h-2" />
            <h3>Pagos</h3>
            <VscTriangleLeft className={`${urlIcon(payments)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={deliveries} className={`${urlClass(deliveries)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <MdDeliveryDining className="mr-1 w-2 h-2" />
            <h3>Entregas</h3>
            <VscTriangleLeft className={`${urlIcon(deliveries)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={orders} className={`${urlClass(orders)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <MdBorderColor className="mr-1 w-2 h-2" />
            <h3>Pedidos</h3>
            <VscTriangleLeft className={`${urlIcon(orders)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={deliveryNote} className={`${urlClass(deliveryNote)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <PiBlueprintFill className="mr-1 w-2 h-2" />
            <h3>Notas</h3>
            <VscTriangleLeft className={`${urlIcon(deliveryNote)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={coins} className={`${urlClass(coins)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <PiCoinsFill className="mr-1 w-2 h-2" />
            <h3>Monedas</h3>
            <VscTriangleLeft className={`${urlIcon(coins)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={telegram} className={`${urlClass(telegram)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <FaTelegram className="mr-1 w-2 h-2" />
            <h3>Telegram</h3>
            <VscTriangleLeft className={`${urlIcon(telegram)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
          <Link href={appearance} className={`${urlClass(appearance)} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-b border-slate-600 flex items-center`}>
            <RiPaintBrushFill className="mr-1 w-2 h-2" />
            <h3>Apariencia</h3>
            <VscTriangleLeft className={`${urlIcon(appearance)} text-slate-200 ml-auto w-3 h-3 relative left-1`} />
          </Link>
        </div>
        <div className={`max-[420px]:min-w-16 min-w-48 ${isOpen ? "" : "max-[420px]:hidden"}`} />
        <section className="bg-slate-200 max-[420px]:p-2 p-4 w-full min-h-[calc(100vh-2.5rem)] overflow-y-auto relative">
          {children}
        </section>
      </div>
    </>
  )
}