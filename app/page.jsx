import React from "react"
import Home from "@/components/pages/Home";

export const metadata = {
  title: "Inicio - Cejblan",
  description: "Página de inicio.",
  openGraph: {
    title: "Inicio - Cejblan",
    description: "Página de inicio.",
    url: "https://www.cejblan-cms.vercel.app/",
  },
};

export default function Cejblan() {
  return (
    <Home />
  )
}

/*
    <section className="Destacado3 bg-center">
        <h1 className="bg-black bg-opacity-70 max-[420px]:text-5xl text-8xl text-white font-bold pt-3 pb-4">
            Cuidado para Hombres
        </h1>
    </section>
*/