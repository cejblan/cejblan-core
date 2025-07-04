import Titulos from "@/components/editable/Titulos";
import WishlistComponent from "@app/pages/WishlistComponent";

export const metadata = {
  title: "Favoritos - Cejblan",
  description: "Página de lista de favoritos (Wish List).",
  openGraph: {
    title: "Favoritos - Cejblan",
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
