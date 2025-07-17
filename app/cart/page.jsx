import CartComponent from "@/components/pages/Cart";
import Titulos from "@/components/editable/Titulos";

export const metadata = {
  title: "Carrito - " + process.env.NEXT_PUBLIC_SITE_NAME,
  description: "Página del Carrito de cada usaurio (cart).",
  openGraph: {
    title: "Carrito - " + process.env.NEXT_PUBLIC_SITE_NAME,
    description: "Página del Carrito de cada usaurio (cart).",
    url: "https://www.cejblan-cms.vercel.app/cart",
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
