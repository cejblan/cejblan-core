import "./globals.css";
import React from "react";
import { Providers } from "@/app/Providers";
import Fondo from "@/components/editable/Fondo";
import Navbar1 from "@/components/editable/Navbar1";
import Navbar2 from "@/components/editable/Navbar2";
import Navbar3 from "@/components/editable/Navbar3";
import Footer1 from "@/components/editable/Footer1";
import Footer2 from "@/components/editable/Footer2";
import Footer3 from "@/components/editable/Footer3";
import fs from "fs";
import path from "path";

export const metadata = {
  property: "og:Cejblan",
  icons: {
    icon: "/favicon.ico",
  },
};

function getBrandingConfig() {
  try {
    const filePath = path.resolve(process.cwd(), "config/themes.json");
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("No se pudo leer themes.json:", error);
    return {};
  }
}

function getNavbarComponent(name) {
  switch (name) {
    case "navbar1":
      return <Navbar1 />;
    case "navbar2":
      return <Navbar2 />;
    case "navbar3":
      return <Navbar3 />;
    default:
      return <Navbar1 />;
  }
}

function getFooterComponent(name) {
  switch (name) {
    case "footer1":
      return <Footer1 />;
    case "footer2":
      return <Footer2 />;
    case "footer3":
      return <Footer3 />;
    default:
      return <Footer1 />;
  }
}

export default function RootLayout({ children }) {
  const branding = getBrandingConfig();
  const navbar = getNavbarComponent(branding.navbar);
  const footer = getFooterComponent(branding.footer);

  return (
    <html lang="es">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6341118636252822"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="bg-gray-100 text-center select-none">
        <Providers>
          {navbar}
          <Fondo>{children}</Fondo>
          {footer}
        </Providers>
      </body>
    </html>
  );
}
