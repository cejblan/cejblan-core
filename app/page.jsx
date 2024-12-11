import React from "react";
import Link from "next/link";
import Image from "next/image";
import Imagen0 from "/public/logo_2023_11-10_IUTECP_white.png";
import Imagen7 from "/public/yanitzaproducciones_thumbnail.webp";
import Imagen8 from "/public/adriliciaus_thumbnail.webp";
import SliderHome from "@/components/SliderHome";

const images = [
  "https://www.cejblan.com/logo_2023_11-10_IUTECP_white.png",
  "https://tusitio.com/HTML.png",
  "https://tusitio.com/CSS.png",
  "https://tusitio.com/JS.png",
  "https://tusitio.com/BOOTSTRAP.png",
  "https://tusitio.com/PHP.png",
  "https://tusitio.com/MySQL.png",
  "https://tusitio.com/yanitzaproducciones_thumbnail.webp",
  "https://tusitio.com/adriliciaus_thumbnail.webp",
];

export const metadata = {
  title: "Inicio - Cejblan",
  description: "Página de inicio.",
  openGraph: {
    title: "Inicio - Cejblan",
    description: "Página de inicio.",
    url: "https://www.cejblan.com/",
    images: images.map((url) => ({ url })),
  },
};

export default function Home() {

  return (
    <>
      <section id="home" className="pt-4">
        <div className="px-4">
          <h2 className="text-4xl">Portafolio de</h2>
          <h1 className="text-5xl">Francisco González</h1>
          <h2 className="text-4xl">TSU en Administración Mención Informática</h2>
        </div>
        <div className="py-8 mt-12 mb-8 bg-slate-200 md:grid grid-cols-3">
          <div className="bg-blue-600 md:rounded-r-2xl flex">
            <Image className="p-2 m-auto w-full flex" src={Imagen0} alt={Imagen0} width={300} height={300} />
          </div>
          <div className="p-2 col-start-2 col-span-3">
            <h2 className="text-3xl">Egresado en septiembre del 2023</h2>
            <h1 className="text-5xl">"Instituto Universitario de<br />Tecnología Elías Calixto Pompa"</h1>
            <h2 className="text-3xl">Promoción XLI</h2>
          </div>
        </div>
      </section>
      <div id="sitiosTrabajados" className="max-[420px]:pt-2 pb-8 py-12 px-2">
        <h1 className="text-5xl pb-4">Sitios Trabajados</h1>
        <div className="text-white grid grid-cols-1 md:grid-cols-2 gap-4 max-[420px]:px-2 px-6">
          <div className="bg-slate-600 hover:bg-slate-500 border-2 rounded-3xl md:p-4 m-auto w-full h-full">
            <h2 className="text-3xl font-bold">Adriliciaus Shop</h2>
            <Image className="w-full shadow-6xl rounded-xl my-2" src={Imagen8} alt={Imagen8} width={400} height={400} />
            <Link href="/adriliciaus" className="bg-orange-500 hover:bg-orange-400 text-2xl font-bold shadow-6xl rounded-xl py-1 px-2" target="_blank">
              Ingresa aquí
            </Link>
          </div>
          <div className="bg-slate-600 hover:bg-slate-500 border-2 rounded-3xl round md:p-4 m-auto w-full h-full">
            <h2 className="text-3xl font-bold">Yanitza Producciones</h2>
            <Image className="w-full shadow-6xl rounded-xl my-2" src={Imagen7} alt={Imagen7} width={400} height={400} />
            <Link href="https://www.yanitzaproducciones.online/" className="bg-orange-500 hover:bg-orange-400 text-2xl font-bold shadow-6xl rounded-xl py-1 px-2" target="_blank">
              Ingresa aquí
            </Link>
          </div>
        </div>
      </div>
      <div id="slider" className="p-4">
        <h1 className="text-4xl">Aprende con mis cursos de:</h1>
        <SliderHome />
      </div>
    </>
  );
}