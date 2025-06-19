import Buttons from "./Buttons";
import { conexion } from "@/libs/mysql";
import { HiOutlineStar, HiStar } from "react-icons/hi2";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import ImageNotSupported from "@/public/ImageNotSupported.webp";

async function loadProduct(productId) {
  const [data] = await conexion.query("SELECT * FROM products WHERE id = ?", [
    productId,
  ]);
  return data;
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await loadProduct(id);

  return (
    <>
      <Link href="/admin/products" className=" bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>
      <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-2 justify-center mb-4">
        <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto ml-4">
          <div className="mb-1">
            <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Nombre:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md">{product.name}</h3>
          </div>
          <div className="mb-2">
            <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Descripción:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md">{product.description}</h3>
          </div>
          <div className="mb-1 flex gap-1 justify-center items-center">
            <h2 className="text-lg font-semibold pr-1">Precio:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md w-full">{product.price}$</h3>
          </div>
          <div className="mb-1 flex gap-1 justify-center items-center">
            <h2 className="text-lg font-semibold pr-1">Cantidad:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md w-full">{product.quantity}</h3>
          </div>
          <div className="mb-1 flex gap-1 justify-center items-center">
            <h2 className="text-lg font-semibold pr-1">Categoría:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md w-full">{product.category}</h3>
          </div>
          <div className="mb-1 flex gap-1 justify-center items-center">
            <h2 className="text-lg font-semibold pr-1">Calificación:</h2>
            <span className="bg-white text-slate-700 py-1 px-2 rounded-md w-full flex max-[420px]:justify-center items-center">
              <HiOutlineStar />
              <HiOutlineStar />
              <HiOutlineStar />
              <HiOutlineStar />
              <HiOutlineStar />
            </span>
          </div>
        </div>
        <div className="max-[420px]:text-center text-left mx-auto">
          <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Imagenes:</h2>
          <div className="grid grid-cols-2 gap-2">
            <Image
              src={product.image || ImageNotSupported}
              className="rounded-md drop-shadow-6xl m-auto h-fit"
              alt={product.name}
              width={100} height={100}
            />
            <Image
              src={product.image || ImageNotSupported}
              className="rounded-md drop-shadow-6xl m-auto h-fit"
              alt={product.name}
              width={100} height={100}
            />
            <Image
              src={product.image || ImageNotSupported}
              className="rounded-md drop-shadow-6xl m-auto h-fit"
              alt={product.name}
              width={100} height={100}
            />
            <Image
              src={product.image || ImageNotSupported}
              className="rounded-md drop-shadow-6xl m-auto h-fit"
              alt={product.name}
              width={100} height={100}
            />
          </div>
        </div>
      </div>
      <Buttons productId={product.id} />
    </>
  );
}