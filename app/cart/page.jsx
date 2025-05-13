import CartComponent from "../components/CartComponent";
import Titulos from "@/components/Titulos";

export const metadata = {
  title: "Pedidos - Cejblan",
  description: "Página de los pedidos de cada usaurio (orders).",
  openGraph: {
    title: "Pedidos - Cejblan",
    description: "Página de los pedidos de cada usaurio (orders).",
    url: "https://www.cejblan.com/orders",
  },
};

export default function CartPage() {


  return (
    <>
      <Titulos texto="Tu Carrito" />
      <CartComponent />
    </>
  );
}
