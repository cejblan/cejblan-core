import Link from "next/link";
import PrecioProducto from "@/components/editable/PrecioProducto";

export default function OrderCard({ order }) {
  const moment = require("moment");
  const date = moment(order.date).subtract(4, "hours").format("DD/MM/YYYY");

  // ===START_RETURN===
  return (
    <div className="bg-white text-slate-800 rounded-xl p-2 shadow-md grid md:grid-cols-4 gap-2 text-sm md:text-base">
      
      {/* Cliente */}
      <div>
        <p className="font-semibold mb-1 text-slate-500">Cliente</p>
        <p><strong>Nombre:</strong> {order.name}</p>
        <p><strong>Correo:</strong> <span className="break-words">{order.email}</span></p>
        <p><strong>Teléfono:</strong> {order.phoneNumber}</p>
      </div>

      {/* Productos */}
      <div>
        <p className="font-semibold mb-1 text-slate-500">Pedido</p>
        <p><strong>Productos:</strong> {order.productsIds}</p>
        <p><strong>Cantidad:</strong> {order.productsQuantity}</p>
        <p><strong>Total:</strong>{" "}
          <span className="text-blue-600 font-bold">
            <PrecioProducto precio={order.totalPrice} format={0} />
          </span>
        </p>
      </div>

      {/* Envío y Pago */}
      <div>
        <p className="font-semibold mb-1 text-slate-500">Entrega & Pago</p>
        <p><strong>Pago:</strong> {order.paymentMethod}</p>
        {order.image && (
          <p>
            <strong>Foto:</strong>{" "}
            <Link
              href={order.image}
              target="_blank"
              className="text-blue-500 underline hover:text-blue-600"
            >
              Ver
            </Link>
          </p>
        )}
        <p><strong>Entrega:</strong> {order.deliveryMethod}</p>
        <p>
          <strong>Dirección:</strong>{" "}
          {order.deliveryMethod === "Delivery" ? order.address : order.deliveryMethodData}
        </p>
      </div>

      {/* Fecha y estado */}
      <div className="text-center">
        <p className="font-semibold text-slate-500">Fecha</p>
        <p>{date}</p>
        <p className="mt-2 font-semibold text-slate-500">Estado</p>
        <p className="text-blue-500 text-lg font-bold">{order.status}</p>
      </div>
    </div>
  );
  // ===END_RETURN===
}
