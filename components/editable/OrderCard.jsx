import Link from "next/link";
import PrecioProducto from "@/components/editable/PrecioProducto";
import branding from "@/config/themes.json";

export default function OrderCard({ order }) {
  const { palette } = branding;
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
          <span
            className="font-bold"
            style={{ color: palette[1] }} // reemplazo de #6ed8bf
          >
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
              className="underline"
              style={{
                color: palette[1],            // reemplazo de #6ed8bf
                "--tw-hover-color": palette[2] // reemplazo de hover #4bb199
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = palette[2]}
              onMouseLeave={(e) => e.currentTarget.style.color = palette[1]}
            >
              Ver
            </Link>
          </p>
        )}
        <p><strong>Entrega:</strong> {order.deliveryMethod}</p>
        <p>
          <>
            {order.deliveryMethodData === "Gratis" || order.deliveryMethodData?.length <= 2 ? (
              <>
                <span className="font-semibold">Costo:</span> {order.deliveryMethodData}
                {order.deliveryMethodData !== "Gratis" && "$"}
                <br />
                <span className="font-semibold">Ubicación:</span> {order.address}
              </>
            ) : (
              <>
                <span className="font-semibold">Ubicación:</span> {order.deliveryMethodData}
              </>
            )}
          </>
        </p>
        {order.deliveryMethod?.includes("Delivery") && order.deliveryName && (
          <p><strong>Repartidor:</strong> {order.deliveryName}</p>
        )}
      </div>

      {/* Fecha y estado */}
      <div className="text-center">
        <p className="font-semibold text-slate-500">Fecha del Pedido</p>
        <p>{date}</p>
        {/* ✅ Mostrar deliveryDate si existe */}
        {order.deliveryDate && (
          <>
            <p className="font-semibold text-slate-500 mt-2">Entrega Programada</p>
            <p className="text-green-600 font-semibold text-sm">
              {moment(order.deliveryDate).format("D MMMM, h:mm A")}
            </p>
          </>
        )}
        <p className="mt-2 font-semibold text-slate-500">Estado</p>
        <p
          className={`text-lg font-bold ${order.status === "COMPLETADO"
              ? "text-green-600"
              : order.status === "PROCESANDO"
                ? "" // aquí reemplazamos con dinámico
                : "text-red-600"
            }`}
          style={{
            color: order.status === "PROCESANDO" ? palette[1] : undefined // reemplazo de #6ed8bf
          }}
        >
          {order.status}
        </p>
      </div>
    </div>
  );
  // ===END_RETURN===
}
