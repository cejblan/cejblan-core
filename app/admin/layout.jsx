import NavbarAdriAdmin from "./components/Navbar"
import "./styles.css"

export const metadata = {
  title: "Modulo Administrativo - Adriliciaus",
  description: "Espacio solo para Administradores (Admin).",
  openGraph: {
    title: "Modulo Administrativo - Adriliciaus",
    description: "Espacio solo para Administradores (Admin).",
    url: "https://www.cejblan.com/admin",
  },
};

export default function RootAdriliciausAdmin({ children }) {
  return (
    <NavbarAdriAdmin>
      {children}
    </NavbarAdriAdmin>
  )
}
