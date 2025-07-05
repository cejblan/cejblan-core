import "./globals.css"
import React from "react";
import Navbar from "@/components/editable/Navbar";
import Footer from "@/components/editable/Footer";
import { Providers } from "@/app/Providers"
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
          <Navbar />
          <section className="bg-[url('https://9mtfxauv5xssy4w3.public.blob.vercel-storage.com/fondo01.jpg')] bg-cover bg-center">
            {children}
          </section>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
