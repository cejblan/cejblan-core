import Prueba from "@/components/pages/Prueba";
import Titulos from "@/components/editable/Titulos";

export const metadata = {
  title: `Prueba - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Descripción de la prueba a ver si vercel despliega la pagina",
  openGraph: {
    title: `Prueba - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Descripción de la prueba a ver si vercel despliega la pagina",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/Prueba`,
  },
};

export default function PruebaPage() {
  return (
    <>
      <Titulos texto="Prueba" />
      <Prueba />
    </>
  );
}
