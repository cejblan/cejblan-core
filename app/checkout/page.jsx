import CheckoutComponent from "../components/CheckoutComponent";

export const metadata = {
  title: "Verificar Pedido - Cejblan",
  description: "Página de verificacion de pedido, pago y entrega (checkout).",
  openGraph: {
    title: "Verificar Pedido - Cejblan",
    description: "Página de verificacion de pedido, pago y entrega (checkout).",
    url: "https://www.cejblan.com/checkout",
  },
};

export default function Checkout() {
  return (
    <CheckoutComponent />
  );
}
