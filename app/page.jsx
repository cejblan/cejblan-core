import React from "react"
import Home from "@/components/pages/Home";
import WhatsappButton from "@/components/editable/WhatsappButton"
import PaypalButton from "@/components/editable/PaypalButton"

export const metadata = {
  title: `Inicio - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Página de inicio.",
  openGraph: {
    title: `Inicio - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Página de inicio.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
  },
};

export default function CejblanPage() {
  return (
    <>
      <Home />
      <PaypalButton />
      <WhatsappButton />
    </>
  )
}