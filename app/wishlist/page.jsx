import Titulos from "@/components/editable/Titulos";
import WishlistComponent from "@/components/pages/Wishlist";

export const metadata = {
  title: "Favoritos - " + process.env.NEXT_PUBLIC_SITE_NAME,
  description: "Página de lista de favoritos (Wish List).",
  openGraph: {
    title: "Favoritos - " + process.env.NEXT_PUBLIC_SITE_NAME,
    description: "Página de lista de favoritos (Wish List).",
    url: "https://www.cejblan-cms.vercel.app/wishlist",
  },
};

export default function WishlistPage() {
  return (
    <>
      <Titulos texto="Tus Favoritos" />
      <WishlistComponent />
    </>
  );
}
