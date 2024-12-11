import React from "react";
import NavbarAdri from "./components/Navbar";
import FooterAdri from "./components/Footer";
import "./styles.css"

export const metadata = {
  icons: {
    icon: "/adriliciaus/favicon.ico",
  },
};

export default function RootAdriliciaus({ children }) {
  return (
    <>
      <NavbarAdri />
      <section id="Adriliciaus" className="Destacado2 bg-gradient-to-b from-slate-700 via-black to-slate-700">
        {children}
      </section>
      <FooterAdri />
    </>
  )
}
