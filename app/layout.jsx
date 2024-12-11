//import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import Footer from "../components/Footer"
import WhatsappButton from "@/components/WhatsappButton"
import PaypalButton from "@/components/PaypalButton"
import { Providers } from "./Providers"

//const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  //Se agrega la etiqueta og:site_name. Metadato de Open Graph
  property: "og:Cejblan",
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
          <Sidebar />
          <Navbar />
          {children}
          <PaypalButton />
          <WhatsappButton />
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
