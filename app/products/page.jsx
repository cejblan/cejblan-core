import Products from "@/components/pages/Products";

export const metadata = {
  title: `Productos - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Página de los productos de la tienda (products).",
  openGraph: {
    title: `Productos - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Página de los productos de la tienda (products).",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
  },
};

export default function ProductsPage() {

  return (
    <Products />
  );
}