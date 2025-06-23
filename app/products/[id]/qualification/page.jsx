import { conexion } from "@/libs/mysql";
import Titulos from "@/components/Titulos";
import Buttons from "./Buttons";

async function loadProduct(productId) {
  const [productData] = await conexion.query(
    "SELECT name FROM products WHERE id = ?",
    [productId]
  );
  const [users] = await conexion.query(
    "SELECT user FROM qualification WHERE product = ?",
    [productId]
  );

  const userList = users.map((item) => item.user);
  const combinedData = {
    name: productData?.name,
    users: userList,
  };

  return combinedData;
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await loadProduct(id);

  return {
    title: `${product.name} - Cejblan`,
    description: `Califica la calidad de ${product.name}.`,
    openGraph: {
      title: `${product.name} - Cejblan`,
      description: `Califica la calidad de ${product.name}.`,
      url: `https://www.cejblan-cms.vercel.app/products/${id}/qualification`,
    },
  };
}

export default async function Qualification({ params }) {
  const { id } = await params;
  const product = await loadProduct(id);

  return (
    <div className="py-6">
      <Titulos texto="Califica tu apreciación del producto:" />
      <div className="bg-white p-4 rounded-xl mx-auto w-fit">
        <div className="bg-blue-700 text-2xl text-white font-bold py-1 px-2 rounded-xl mx-auto w-fit">
          {product.name}
        </div>
        <Buttons params={params} users={product.users} />
      </div>
    </div>
  );
}