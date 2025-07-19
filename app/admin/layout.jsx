import NavbarAdmin from "./components/Navbar"
import "./styles.css"

export const metadata = {
  title: `Modulo Administrativo - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Espacio solo para Administradores (Admin).",
  openGraph: {
    title: `Modulo Administrativo - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Espacio solo para Administradores (Admin).",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
  },
};

export default function RootCejblanAdmin({ children }) {
  return (
    <NavbarAdmin>
      {children}
    </NavbarAdmin>
  )
}
