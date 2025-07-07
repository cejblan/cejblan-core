import CheckoutComponent from "@/components/editable/Checkout";

export const metadata = {
  title: "Verificar Pedido - " + process.env.NEXT_PUBLIC_SITE_NAME,
  description: "Página de verificacion de pedido, pago y entrega (checkout).",
  openGraph: {
    title: "Verificar Pedido - " + process.env.NEXT_PUBLIC_SITE_NAME,
    description: "Página de verificacion de pedido, pago y entrega (checkout).",
    url: "https://www.cejblan-cms.vercel.app/checkout",
  },
};

export default function Checkout() {
  return (
    <CheckoutComponent />
  );
}
