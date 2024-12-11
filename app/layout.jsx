import "./globals.css"
import React from "react";
import NavbarAdri from "./components/Navbar";
import FooterAdri from "./components/Footer";
import WhatsappButton from "@/components/WhatsappButton"
import PaypalButton from "@/components/PaypalButton"
import { Providers } from "./Providers"
//import { Inter } from "next/font/google"
//const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  property: "og:Cejblan",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6341118636252822"
          crossOrigin="anonymous"></script>
      </head>
      <body className=/*{*/"text-center select-none "/* + inter.className}*/>
        <Providers>
          <NavbarAdri />
          <section id="Adriliciaus" className="Destacado2 bg-gradient-to-b from-slate-700 via-black to-slate-700">
            {children}
          </section>
          <PaypalButton />
          <WhatsappButton />
          <FooterAdri />
        </Providers>
      </body>
    </html>
  )
}
