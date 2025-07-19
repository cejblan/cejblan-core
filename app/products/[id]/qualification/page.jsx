import Qualification from "@/components/pages/Qualification";
import { conexion } from "@/libs/mysql";

async function loadProduct(id) {
  const [productData] = await conexion.query(
    "SELECT name FROM products WHERE id = ?",
    [id]
  );
  const [users] = await conexion.query(
    "SELECT user FROM qualification WHERE product = ?",
    [id]
  );

  return {
    name: productData[0]?.name,
    users: users.map((u) => u.user),
  };
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: `Calificación del producto - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Página para calificar el producto",
    openGraph: {
      title: `Calificación del producto - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      description: "Página para calificar el producto",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}/qualification`,
    },
  };
}

export default async function QualificationPage({ params }) {
  const { id } = await params;
  const product = await loadProduct(id);

  return (
    <Qualification
      id={id}
      name={product.name}
      users={product.users}
    />
  );
}