import Buttons from "./Buttons";
import { conexion } from "@/libs/mysql";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { MdDeliveryDining } from "react-icons/md";

async function LoadDelivery(deliveryId) {
  const [data] = await conexion.query("SELECT * FROM deliveries WHERE id = ?", [
    deliveryId,
  ]);
  return data[0];
}

export default async function DeliveryPage({ params }) {
  const { id } = await params;
  const delivery = await LoadDelivery(id);

  return (
    <>
      <Link href={`/admin/deliveries/`} className=" bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>
      <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-2 justify-center md:pl-3 mb-4">
        <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto ml-4">
          <div className="mb-1">
            <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Id:</h2>
            <h3 className="bg-white text-gray-400 py-1 px-2 rounded-md">{delivery.id}</h3>
          </div>
          <div className="mb-1">
            <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Nombre:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md">{delivery.name}</h3>
          </div>
          <div className="mb-1">
            <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Datos:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md">{delivery.data}</h3>
          </div>
          <div className="mb-1">
            <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Condición:</h2>
            <h3 className="bg-white py-1 px-2 rounded-md">{delivery.status}</h3>
          </div>
        </div>
        <div className="max-[420px]:text-center text-left mx-auto">
          <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Imagen:</h2>
          <div className="grid grid-cols-1">
          <MdDeliveryDining className="text-[18rem]" />
          </div>
        </div>
      </div>
      <Buttons deliveryId={delivery.id} />
    </>
  );
}