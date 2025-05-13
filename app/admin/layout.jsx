import NavbarAdmin from "./components/Navbar"
import "./styles.css"

export const metadata = {
  title: "Modulo Administrativo - Cejblan",
  description: "Espacio solo para Administradores (Admin).",
  openGraph: {
    title: "Modulo Administrativo - Cejblan",
    description: "Espacio solo para Administradores (Admin).",
    url: "https://www.cejblan.com/admin",
  },
};

export default function RootCejblanAdmin({ children }) {
  return (
    <NavbarAdmin>
      {children}
    </NavbarAdmin>
  )
}
