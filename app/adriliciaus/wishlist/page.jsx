import Titulos from "@/components/Titulos";
import WishlistComponent from "../components/WishlistComponent";

export const metadata = {
  title: "Favoritos - Adriliciaus",
  description: "Página de lista de favoritos (Wish List).",
  openGraph: {
    title: "Favoritos - Adriliciaus",
    description: "Página de lista de favoritos (Wish List).",
    url: "https://www.cejblan.com/adriliciaus/wishlist",
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
