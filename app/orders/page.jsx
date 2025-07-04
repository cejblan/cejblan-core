
import Orders from "@/components/pages/Orders";
import Titulos from "@/components/Titulos";

export const metadata = {
  title: "Pedidos - Cejblan",
  description: "Página de los pedidos de cada usaurio (orders).",
  openGraph: {
    title: "Pedidos - Cejblan",
    description: "Página de los pedidos de cada usaurio (orders).",
    url: "https://www.cejblan-cms.vercel.app/orders",
  },
};

export default function OrdersPage() {
  return (
    <>
      <Titulos texto="Tus Pedidos" />
      <Orders />
    </>
  );
}