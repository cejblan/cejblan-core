import Link from "next/link";
import PrecioProducto from "@/app/components/PrecioProducto";

export default function OrderCard({ order }) {
  const moment = require("moment");
  const date = moment(order.date).subtract(4, "hours").format("DD/MM/YYYY")

  return (
    <div className="bg-slate-200 text-slate-900 max-[420px]:text-sm text-base text-left font-bold leading-5 max-[420px]:block grid grid-cols-12 justify-center items-center gap-2 p-1 shadow-6xl rounded-xl z-10">
      <div className="col-start-1 col-end-5 max-[420px]:pl-0 pl-1 border-r max-[420px]:border-slate-200 border-slate-400 flex">
        <div>
          <p>Nombre:</p>
          <p>Correo:</p>
          <p>Teléfono:</p>
        </div>
        <div className="ml-1">
          <p>{order.name}</p>
          <p className="max-[420px]:text-xs">{order.email}</p>
          <p>{order.phoneNumber}</p>
        </div>
      </div>
      <div className="col-start-5 col-end-8 border-r max-[420px]:border-slate-200 border-slate-400 flex">
        <div>
          <p>Productos:</p>
          <p>Cantidad:</p>
          <p>Total:</p>
        </div>
        <div className="ml-1">
          <p>{order.productsIds}</p>
          <p>{order.productsQuantity}</p>
          <h2 className="text-lg text-slate-700 font-bold">
            <PrecioProducto precio={order.totalPrice} format={0} />
          </h2>
        </div>
      </div>
      <div className="col-start-8 col-end-11 border-r max-[420px]:border-slate-200 border-slate-400 flex">
        <div>
          <p>Pago:</p>
          {order.image &&
            <p>Foto Billete:</p>
          }
          <p>Entrega:</p>
          <p>Dirección:</p>
        </div>
        <div className="ml-1">
          <p>{order.paymentMethod}</p>
          {order.image &&
            <Link
              href={order.image}
              className="text-blue-500 hover:text-blue-600 underline"
              target="_blank">
              Foto
            </Link>
          }
          <p>{order.deliveryMethod}</p>
          {order.deliveryMethod === "Delivery" ?
            <p>{order.address}</p>
            :
            <p>{order.deliveryMethodData}</p>
          }
        </div>
      </div>
      <div className="col-start-11 col-end-13 text-center max-[420px]:mt-2">
        <p>Fecha:</p>
        <p>{date}</p>
        <p>Estado:</p>
        <p className="text-lg text-blue-500 font-bold">{order.status}</p>
      </div>
    </div>
  );
}