import NavbarAdmin from "./components/Navbar";
import { loadPlugins } from "@/libs/loadPlugins";
import "./styles.css";

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
  // Carga los plugins desde app/admin/plugins
  const plugins = loadPlugins();

  return (
    <NavbarAdmin plugins={plugins}>
      {children}
    </NavbarAdmin>
  );
}
