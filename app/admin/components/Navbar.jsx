"use client"

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { FaPlus, FaTelegram, FaSignOutAlt, FaHome } from "react-icons/fa";
import { AiFillDashboard, AiFillShopping } from "react-icons/ai";
import { IoPersonSharp } from "react-icons/io5";
import { MdCategory, MdDeliveryDining, MdBorderColor } from "react-icons/md";
import { PiBlueprintFill, PiCoinsFill, PiCurrencyDollarSimpleFill } from "react-icons/pi";
import { RiPaintBrushFill } from "react-icons/ri";
import { TiThMenu } from "react-icons/ti";
import { VscTriangleLeft, VscSettings } from "react-icons/vsc";
import Image from "next/image";
import Loading from "../../components/Loading";
import Link from "next/link";

const NEW_ITEMS = [
  { href: "/admin/users/new", label: "Usuario", icon: FaPlus },
  { href: "/admin/products/new", label: "Producto", icon: FaPlus },
  { href: "/admin/categories/new", label: "Categoría", icon: FaPlus },
  { href: "/admin/payments/new", label: "Forma de Pago", icon: FaPlus },
  { href: "/admin/deliveries/new", label: "Forma de Entrega", icon: FaPlus },
];

const MAIN_ITEMS = [
  { href: "/admin", label: "Tablero", icon: AiFillDashboard },
  { href: "/admin/users", label: "Usuarios", icon: IoPersonSharp, match: /^\/admin\/users/ },
  { href: "/admin/products", label: "Productos", icon: AiFillShopping, match: /^\/admin\/products/ },
  { href: "/admin/categories", label: "Categorías", icon: MdCategory },
  { href: "/admin/payments", label: "Pagos", icon: PiCurrencyDollarSimpleFill },
  { href: "/admin/deliveries", label: "Entregas", icon: MdDeliveryDining },
  { href: "/admin/orders", label: "Pedidos", icon: MdBorderColor },
  { href: "/admin/deliveryNote", label: "Notas", icon: PiBlueprintFill },
  { href: "/admin/coins", label: "Monedas", icon: PiCoinsFill },
  { href: "/admin/telegram", label: "Telegram", icon: FaTelegram },
  { href: "/admin/cms", label: "CMS", icon: RiPaintBrushFill },
  { href: "/admin/settings", label: "Configurar", icon: VscSettings },
];

export default function NavbarAdmin({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTwo, setIsOpenTwo] = useState(false);
  const [isOpenThree, setIsOpenThree] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (href, match) => match ? match.test(pathname) : pathname === href;

  if (status === "loading") return <Loading zIndex={50} />;

  const handleNewMenuClick = () => {
    setIsOpenTwo((prev) => {
      if (!prev) setIsOpen(false);
      return !prev;
    });
  };

  return (
    <>
      <nav className="text-white text-base w-full fixed z-20">
        <div className="bg-slate-800 w-full flex items-center pl-1">
          <button
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (isOpenTwo) setIsOpenTwo(false); // cerrar menú de "news" si está abierto
            }}
            className="hover:bg-slate-700 hover:text-blue-300 p-1 flex items-center"
          >
            <TiThMenu />
          </button>
          <Link href="/" className="hover:bg-slate-700 hover:text-blue-300 p-1 flex items-center">
            <FaHome className="mr-1 w-3 h-3" />
            <h1 className="font-bold max-[420px]:hidden">CejblanCMS</h1>
          </Link>
          <div onClick={handleNewMenuClick} className="p-1 relative">
            <FaPlus className={`hover:fill-blue-300 w-3 h-3 ${isOpenTwo ? "rotate-45" : ""}`} />
            {isOpenTwo && (
              <div className="menu bg-slate-700 rounded-xl absolute top-6 left-[-3rem] text-sm">
                {NEW_ITEMS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`${isActive(href) ? "bg-slate-700" : ""} hover:bg-slate-600 hover:text-blue-300 p-1 flex items-center`}
                  >
                    <Icon className="mr-1 w-2 h-2" />
                    <h2 className="w-max">{label}</h2>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hover:bg-slate-700 hover:text-blue-300 p-1 border-l border-slate-600 ml-auto flex justify-end items-center relative" onClick={() => setIsOpenThree(!isOpenThree)}>
            <h2 className="text-xs mr-1">{session?.user.name}</h2>
            <Image
              src={session?.user.image}
              alt="Imagen de Usuario"
              className="w-3 h-3 rounded-full cursor-pointer"
              width={100}
              height={100}
            />
            {isOpenThree && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-slate-700 hover:bg-slate-600 py-1 px-2 rounded-b-xl w-max absolute top-5 right-0 flex items-center"
              >
                Cerrar Sesión <FaSignOutAlt className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-5 flex transition-all duration-300">
        <div
          className={`bg-slate-800 text-white text-left text-sm transition-all duration-300 overflow-y-auto ${isOpen ? 'w-fit min-w-[7.8rem]' : 'w-0 min-w-0'
            }`}
        >
          {MAIN_ITEMS.map(({ href, label, icon: Icon, match }) => (
            <Link
              key={href}
              href={href}
              className={`${isActive(href, match) ? "bg-slate-700" : ""} hover:bg-slate-600 hover:text-blue-300 py-1 pl-1 border-t border-slate-600 flex items-center`}
            >
              <Icon className="mr-1 w-2 h-2" />
              <h3>{label}</h3>
              {isActive(href, match) && <VscTriangleLeft className="text-slate-200 ml-auto w-3 h-3" />}
            </Link>
          ))}
        </div>
        <section className="bg-slate-200 p-4 w-full min-h-[calc(100vh-2.5rem)] overflow-y-auto relative transition-all duration-300">
          {children}
        </section>
      </div>
    </>
  );
}