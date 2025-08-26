import Test from "@/components/pages/Test";
import Titulos from "@/components/editable/Titulos";

export const metadata = {
  title: `Test - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Descripcion Test",
  openGraph: {
    title: `Test - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Descripcion Test",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/Test`,
  },
};

export default function TestPage() {
  return (
    <>
      <Titulos texto="Test" />
      <Test />
    </>
  );
}
