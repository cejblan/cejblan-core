import React from 'react'
import Link from "next/link"
import { RiWhatsappLine } from "react-icons/ri";
import { FaTelegram } from "react-icons/fa";

export default function Home() {
  return (
    // ===START_RETURN===
    <section className="text-white max-[420px]:text-center text-end py-8 max-[420px]:py-4 max-[420px]:px-2 px-12 max-[420px]:block grid content-start justify-end">
      <div className="bg-slate-700 rounded-3xl pt-1 pb-2 px-4">
        <h1 className="max-[420px]:text-5xl text-8xl font-bold">El futuro de la web está en tus manos</h1>
        <h1 className="max-[420px]:text-3xl text-6xl font-bold">¡Comienza a construirlo hoy!</h1>
      </div>
      <div className="py-4 max-[420px]:block flex gap-2 content-start justify-end">
        <Link
          href="https://api.whatsapp.com/send?text=Hola,%20para%20preguntar%20por%20unos%20prouctos&phone=584142245444"
          className="bg-green-600 hover:bg-green-500 text-slate-200 hover:text-white text-3xl font-bold whitespace-nowrap flex content-center justify-center rounded-3xl py-1 pl-2 pr-1 max-[420px]:mx-auto w-min">
          WhatsApp<RiWhatsappLine />
        </Link>
        <Link
          href={`https://t.me/${process.env.BOT_NAME}`}
          className="bg-[#6ed8bf] hover:bg-blue-500 text-slate-200 hover:text-white text-3xl font-bold whitespace-nowrap flex content-center justify-center rounded-3xl py-1 pl-2 pr-1 max-[420px]:mt-2 max-[420px]:mx-auto w-min">
          Bot Telegram<FaTelegram />
        </Link>
      </div>
    </section>
    // ===END_RETURN===
  )
}