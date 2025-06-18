import ProductsComponent from "../components/ProductsComponent";

export const metadata = {
  title: "Productos - Cejblan",
  description: "Página de los productos de la tienda (products).",
  openGraph: {
    title: "Productos - Cejblan",
    description: "Página de los productos de la tienda (products).",
    url: "https://www.cejblan-cms.vercel.app/products",
  },
};

export default function ProductsPage() {

  return (
    <ProductsComponent />
  );
}