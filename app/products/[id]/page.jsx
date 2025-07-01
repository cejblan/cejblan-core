import Buttons from "./Buttons";
import { conexion } from "@/libs/mysql";
import { HiOutlineStar, HiStar } from "react-icons/hi2";
import Image from "next/image";
import Titulos from "@/components/Titulos";
import PrecioProducto from "@/app/components/PrecioProducto";

async function loadProduct(productId) {
  const [productData] = await conexion.query(
    "SELECT * FROM products WHERE id = ?",
    [productId]
  );
  const [qualifications] = await conexion.query(
    "SELECT value FROM qualification WHERE product = ?",
    [productId]
  );

  return {
    ...productData[0],  // Usa el spread operator para incluir todo el producto
    qualifications: qualifications.map((item) => item.value), // Simplificar el array de calificaciones
  };
}
// Optimizar el cálculo del promedio
const calculateAverage = (qualifications) => {
  if (qualifications.length === 0) return 0; // Evitar divisiones por 0
  const total = qualifications.reduce((sum, value) => sum + value, 0);
  return total / qualifications.length;
};
// Función para crear estrellas de calificación
const renderStars = (average) => {
  const filledStars = Math.floor(average);
  const emptyStars = 5 - filledStars;
  return (
    <>
      {[...Array(filledStars)].map((_, i) => <HiStar key={i} />)}
      {[...Array(emptyStars)].map((_, i) => <HiOutlineStar key={i + filledStars} />)}
    </>
  );
};

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await loadProduct(id);

  return {
    title: `${product.name} - Cejblan`,
    description: product.description || "Descubre este producto increíble en nuestra tienda.",
    openGraph: {
      title: `${product.name} - Cejblan`,
      description: product.description,
      url: `https://www.cejblan-cms.vercel.app/products/${id}`,
      images: [
        {
          url: product.image,
          alt: `Imagen del producto ${product.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - Cejblan`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await loadProduct(id);

  const average = calculateAverage(product.qualifications);
  const totalRatings = product.qualifications.length; // Número total de calificaciones

  return (
    <>
      <Titulos texto="Datos del Producto" />
      <div className="flex justify-center items-center pb-8 max-[420px]:px-2 px-16 m-auto min-h-screen">
        <div className="bg-white bg-opacity-95 rounded-xl shadow-6xl max-[420px]:block flex w-full h-full justify-center">
          <div className="p-3 w-full flex flex-col justify-between min-h-[500px]"> {/* Cambiado aquí */}
            <div> {/* Contenido superior */}
              <h3 className="text-4xl font-bold min-h-10">{product.name}</h3>
              <PrecioProducto precio={product.price} format={1} />
              <p className="text-slate-800 max-[420px]:text-base text-lg font-bold min-h-14">{product.description}</p>
            </div>

            <div className="mt-6"> {/* Botones abajo */}
              <p className="text-[#64ffda] text-xl text-left font-bold pl-1 mt-2">Categoría:
                <span className="text-slate-700 ml-1">{product.category}</span>
              </p>
              <p className="text-[#64ffda] text-xl text-left font-bold flex items-center pl-1">Calificación:
                <span className="text-slate-700 ml-1 flex justify-center items-center">
                  {renderStars(average)}
                  <span className="ml-1 text-slate-600 text-base">({totalRatings} Cliente{totalRatings === 1 ? '' : 's'})</span>
                </span>
              </p>
              <Buttons product={product} />
            </div>
          </div>

          <Image
            src={product.image}
            className="w-full h-full object-cover max-[420px]:rounded-b-xl md:rounded-bl-none md:rounded-r-xl shadow-6xl"
            alt={product.name}
            width={300}
            height={300}
          />
        </div>
      </div>

    </>
  );
}