import CheckoutComponent from "../components/CheckoutComponent";

export const metadata = {
  title: "Verificar Pedido - Adriliciaus",
  description: "Página de verificacion de pedido, pago y entrega (checkout).",
  openGraph: {
    title: "Verificar Pedido - Adriliciaus",
    description: "Página de verificacion de pedido, pago y entrega (checkout).",
    url: "https://www.cejblan.com/adriliciaus/checkout",
  },
};

export default function Checkout() {
  return (
    <CheckoutComponent />
  );
}
