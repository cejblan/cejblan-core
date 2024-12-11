import ProductsComponent from "../components/ProductsComponent";

export const metadata = {
  title: "Productos - Adriliciaus",
  description: "Página de los productos de la tienda (products).",
  openGraph: {
    title: "Productos - Adriliciaus",
    description: "Página de los productos de la tienda (products).",
    url: "https://www.cejblan.com/adriliciaus/products",
  },
};

export default function ProductsPage() {

  return (
    <ProductsComponent />
  );
}