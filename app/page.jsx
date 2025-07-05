import React from "react"
import Home from "@/components/pages/Home";
import WhatsappButton from "@/components/editable/WhatsappButton"
import PaypalButton from "@/components/editable/PaypalButton"

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
    <>
      <Home />
      <PaypalButton />
      <WhatsappButton />
    </>
  )
}