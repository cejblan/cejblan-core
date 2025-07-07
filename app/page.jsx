import React from "react"
import Home from "@/components/pages/Home";
import WhatsappButton from "@/components/editable/WhatsappButton"
import PaypalButton from "@/components/editable/PaypalButton"

export const metadata = {
  title: "Inicio - " + process.env.NEXT_PUBLIC_SITE_NAME,
  description: "Página de inicio.",
  openGraph: {
    title: "Inicio - " + process.env.NEXT_PUBLIC_SITE_NAME,
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