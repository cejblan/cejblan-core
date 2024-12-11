
import OrdersComponent from "../components/OrdersComponent";
import Titulos from "@/components/Titulos";

export const metadata = {
  title: "Pedidos - Adriliciaus",
  description: "Página de los pedidos de cada usaurio (orders).",
  openGraph: {
    title: "Pedidos - Adriliciaus",
    description: "Página de los pedidos de cada usaurio (orders).",
    url: "https://www.cejblan.com/adriliciaus/orders",
  },
};

export default function OrdersPage() {
  return (
    <>
      <Titulos texto="Tus Pedidos" />
      <OrdersComponent />
    </>
  );
}