import Titulos from "@/components/Titulos";
import WishlistComponent from "../components/WishlistComponent";

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
