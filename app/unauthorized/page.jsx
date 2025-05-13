import { GiCat } from "react-icons/gi";

export const metadata = {
  title: "No Autorizado - Cejblan",
  description: "Página de acceso no autorizado (unauthorized).",
  openGraph: {
    title: "No Autorizado - Cejblan",
    description: "Página de acceso no autorizado (unauthorized).",
    url: "https://www.cejblan.com/unauthorized",
  },
};

export default function UnauthorizedPage() {
  return (
    <div className="text-white font-bold py-6 flex justify-center items-center">
      <h1 className="text-6xl">Acceso Denegado</h1>
      <h2 className="text-4xl">Modulo solo para Administradores</h2>
      <GiCat className="text-9xl m-auto" />
    </div>
  )
}