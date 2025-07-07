import CartComponent from "@/components/pages/Cart";
import Titulos from "@/components/editable/Titulos";

export const metadata = {
  title: "Pedidos - " + process.env.NEXT_PUBLIC_SITE_NAME,
  description: "Página de los pedidos de cada usaurio (orders).",
  openGraph: {
    title: "Pedidos - " + process.env.NEXT_PUBLIC_SITE_NAME,
    description: "Página de los pedidos de cada usaurio (orders).",
    url: "https://www.cejblan-cms.vercel.app/orders",
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
