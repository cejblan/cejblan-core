"use client";
import { useRef, useState, useEffect } from "react";
import Titulos from "@/components/editable/Titulos";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoadProductsCart } from "../LoadProductsCart";
import { LoadCheckoutData } from "../LoadCheckoutData";
import { LoadProfileData } from "../LoadProfileData";
import { CalculateTotalPrice, GroupedProducts } from "../GroupedProducts";
import dynamic from "next/dynamic";
import Image from "next/image";
import Loading from "../editable/Loading";
import ProductCardAdmin from "@/app/admin/components/ProductCardAdmin";
import ImageNotSupported from "@/public/ImageNotSupported.webp";
import PrecioProducto from "@/components/editable/PrecioProducto";
// Carga el componente Maps dinámicamente y desactiva SSR
const Maps = dynamic(() => import("../Maps"), { ssr: false });
import moment from "moment";
import "moment/locale/es";
moment.locale("es");

export default function Checkout() {
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState("");

  const [showFreeDeliveryModal, setShowFreeDeliveryModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession(); // Obtener la sesión actual del usuario
  const [products, setProducts] = useState([]);
  const sessionUser = session?.user?.email;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const groupedProducts = GroupedProducts(products);
  const totalPrice = parseFloat(CalculateTotalPrice(groupedProducts));
  const [latitudeNew, setLatitude] = useState();
  const [longitudeNew, setLongitude] = useState();
  const [dataCheckout, setDataCheckout] = useState([]);
  const [data, setData] = useState([
    {
      phoneCode: "",
      phoneCodeDos: "",
      phoneNumber: "",
      phoneNumberDos: "",
      address: "",
      phoneNumberSelected: "",
      paymentMethod: "",
      deliveryMethod: "",
      chatId: "",
    }
  ]);
  const showPhoneNumber = "+58" + data[0].phoneCode + data[0].phoneNumber;
  const showPhoneNumberDos = "+58" + data[0].phoneCodeDos + data[0].phoneNumberDos;

  const [allowedHours, setAllowedHours] = useState([]);

  const selectedDelivery = dataCheckout?.[1]?.[0]?.find(opt => opt.name === data?.[0]?.deliveryMethod);

  const [freeDeliveryLimit, setFreeDeliveryLimit] = useState(null);
  const isFreeDelivery = freeDeliveryLimit !== null && totalPrice >= freeDeliveryLimit;

  let deliveryCost = 0;
  if (!isFreeDelivery && selectedDelivery && selectedDelivery.data?.length === 1 && !isNaN(selectedDelivery.data)) {
    deliveryCost = parseFloat(selectedDelivery.data);
  }

  const finalTotal = totalPrice + deliveryCost;

  useEffect(() => {
    const fetchFreeDeliveryLimit = async () => {
      try {
        const res = await fetch("/api/admin/settings/free_delivery");
        const json = await res.json();
        const limit = parseFloat(json.value); // asumiendo que value tiene el monto
        setFreeDeliveryLimit(limit);
      } catch (error) {
        console.error("Error cargando free delivery limit:", error);
      }
    };
    fetchFreeDeliveryLimit();
  }, []);

  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const res = await fetch("/api/admin/settings/delivery");
        const data = await res.json();

        let hours = [];

        if (data.deliveryHours && data.deliveryHours.trim() !== "") {
          hours = data.deliveryHours.split(",").map(h => h.trim());
        } else if (data.workingHours) {
          const [start, end] = data.workingHours.split("-");
          const startHour = parseInt(start.split(":")[0]);
          const endHour = parseInt(end.split(":")[0]);

          hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
            return `${(startHour + i).toString().padStart(2, "0")}:00`;
          });
        }

        setAllowedHours(hours);
      } catch (err) {
        console.error("Error cargando horarios:", err);
      }
    };

    fetchDeliverySettings();
  }, []);

  useEffect(() => {
    if (
      isFreeDelivery &&
      data[0]?.deliveryMethod?.includes("Delivery")
    ) {
      setShowFreeDeliveryModal(true);
    }
  }, [data[0]?.deliveryMethod, totalPrice]);

  const handleChange = (event) => {
    setData([
      {
        ...data[0],
        [event.target.name]: event.target.value,
      }
    ]);
  };

  const handlePositionChange = (newPosition) => {
    const latitudeTruncated = parseFloat(newPosition[0].toFixed(7));
    const longitudeTruncated = parseFloat(newPosition[1].toFixed(7));
    setLatitude(latitudeTruncated);
    setLongitude(longitudeTruncated);
  };

  const productsIds = products.map(product => product.id);
  const productsQuantity = products.map(product => product.quantity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // 🔹 Desactiva el botón

    const formData = new FormData();
    formData.append("productsIds", productsIds);
    formData.append("productsQuantity", productsQuantity);
    formData.append("totalPrice", totalPrice);
    formData.append("name", data[0].name);
    formData.append("email", data[0].email);
    formData.append("phoneNumber", data[0].phoneNumberSelected);
    formData.append("paymentMethod", data[0].paymentMethod);
    formData.append("deliveryMethod", data[0].deliveryMethod);
    formData.append("address", data[0].address);
    formData.append("latitude", data[0].latitude);
    formData.append("longitude", data[0].longitude);
    formData.append("chatId", data[0].chatId);
    if (deliveryDate) {
      formData.append("deliveryDate", deliveryDate);
    }

    const deliveryMethodData = dataCheckout[1][0].find(option => option.name === data[0]?.deliveryMethod);

    // Si es opción con "Delivery" y es gratis, guarda el texto especial
    if (deliveryMethodData && isFreeDelivery && data[0]?.deliveryMethod?.includes("Delivery")) {
      formData.append("deliveryMethodData", "Gratis");
    } else if (deliveryMethodData) {
      formData.append("deliveryMethodData", deliveryMethodData.data);
    }

    if (file) {
      formData.append("image", file);
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const deleteProduct = await fetch("/api/cart/deleteProduct", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productsIds }),
        });

        if (deleteProduct.ok) {
          console.log("Carrito vaciado");
        } else {
          const errorData = await deleteProduct.json();
          console.log(errorData.message);
        }

        const dataOrder = await res.json();
        const telegram = await fetch("/api/telegram/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataOrder }),
        });

        if (telegram.ok) {
          console.log("Pedido enviando al Telegram");
        } else {
          const errorData = await telegram.json();
          console.log(errorData.message);
        }

        alert("Pedido Enviado");
        router.push("/orders");
      } else {
        alert("Error al enviar el pedido");
      }
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      alert("Hubo un problema al procesar el pedido");
    } finally {
      setIsSubmitting(false); // 🔹 Reactiva si quieres que el usuario pueda reintentar
    }
  };

  //Estilos input
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("Ningún archivo seleccionado");
  const handleChange2 = (event) => {
    const files = event.target.files;
    if (files.length === 0) {
      setFileName(dataEmpty);
    } else if (files.length > 1) {
      setFileName(`${files.length} archivos seleccionados`);
    } else {
      setFileName(files[0].name);
    }
    setFile(event.target.files[0]);
  };
  //Fin estilos input
  useEffect(() => {
    if (sessionUser) {
      setIsLoading(true);
      const loadData = async () => {
        try {
          // Cargar productos
          await LoadProductsCart(sessionUser, setProducts);
          // Cargar datos del checkout
          await LoadCheckoutData(setDataCheckout);
          // Cargar datos del perfil
          await LoadProfileData(sessionUser, setData);
          setIsDataLoaded(true); // Indicar que los datos han sido cargados correctamente
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setIsLoading(false); // Finaliza la carga
        }
      };
      loadData();
    }
  }, [sessionUser]);

  useEffect(() => {
    if (isDataLoaded && data.length > 0) {
      // Validar datos después de que se hayan cargado
      if (
        !data[0]?.phoneNumber ||
        !data[0]?.address ||
        !data[0]?.latitude ||
        !data[0]?.longitude
      ) {
        alert("Debes llenar tus datos en el perfil para poder comprar");
        router.push("/profile");
      }
    }
  }, [isDataLoaded, data, router]);

  if (isLoading || !data[0].phoneNumber || !data[0].address || !data[0].latitude || !data[0].longitude) {
    return <Loading zIndex={40} />;
  }

  return (
    // ===START_RETURN===
    <form onSubmit={handleSubmit}>
      <Titulos texto="Datos del Pedido" />
      <div className="max-[420px]:block grid grid-cols-8 gap-2 justify-center py-2 max-[420px]:px-2 px-4">
        <div className="bg-white p-2 rounded-xl shadow-6xl max-[420px]:mb-2 h-fit w-full col-start-1 col-end-3">
          <h2 className="block text-slate-700 font-medium mb-1">Tu Carrito</h2>
          {isLoading ? (
            <p className="text-lg font-medium">Cargando productos...</p>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {groupedProducts.map((product, index) => (
                <ProductCardAdmin product={product} key={index} />
              ))}
            </div>
          )}
          <div className="mt-2 text-slate-700 text-lg font-semibold">
            <p>Total productos: <PrecioProducto precio={totalPrice.toFixed(2)} format={0} /></p>
            {data[0]?.deliveryMethod?.includes("Delivery") && (
              <p>Costo de delivery: <PrecioProducto precio={(isFreeDelivery ? 0 : deliveryCost).toFixed(2)} format={0} /></p>
            )}
            <p className="text-xl mt-1">Total a pagar: <PrecioProducto precio={finalTotal.toFixed(2)} format={0} /></p>
          </div>
        </div>
        <div className="bg-white p-2 rounded-xl shadow-6xl max-[420px]:mb-2 h-fit w-full col-start-3 col-end-5">
          <div className="mb-1">
            <h2 className="block text-slate-700 font-medium mb-1">Nombre y Apellido:</h2>
            <h2 className="block bg-slate-100 text-slate-500 text-center border border-slate-400 py-1 max-[420px]:px-1 px-2 w-full rounded-xl">
              {data[0]?.name}
            </h2>
          </div>
          <div className="mb-1">
            <h2 className="block text-slate-700 font-medium mb-1">Correo Electrónico:</h2>
            <h2 className="block bg-slate-100 text-slate-500 text-center border border-slate-400 py-1 max-[420px]:px-1 px-2 w-full rounded-xl">
              {data[0]?.email}
            </h2>
          </div>
          <div className="mb-1">
            <label htmlFor="phoneNumberSelected" className="block text-slate-700 font-medium mb-1">
              Número telefónico:
            </label>
            <select
              id="phoneNumberSelected"
              name="phoneNumberSelected"
              onChange={handleChange}
              className="bg-slate-100 text-center border border-slate-400 py-1 px-2 rounded-xl w-full"
              required
            >
              <option value="">Selecciona el Número</option>
              <option value={showPhoneNumber}>{showPhoneNumber}</option>
              {data[0].phoneNumberDos &&
                <option value={showPhoneNumberDos}>{showPhoneNumberDos}</option>
              }
            </select>
          </div>
        </div>
        <div className="bg-white p-2 rounded-xl shadow-6xl max-[420px]:mb-2 h-fit w-full col-start-5 col-end-7">
          <div className="mb-1">
            <label htmlFor="paymentMethod" className="block text-slate-700 font-medium mb-1">
              Forma de Pago:
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={data[0]?.paymentMethod}
              onChange={handleChange}
              className="bg-slate-100 text-center border border-slate-400 py-1 px-2 w-full rounded-xl"
              required
            >
              <option value="">Seleccione una opción</option>
              {dataCheckout[0][0]?.map((option, index) => (
                <option key={index} value={option.name}>{option.name}</option>
              ))}
            </select>
            {dataCheckout[0][0]?.map((option, index) => (
              data[0]?.paymentMethod === option.name && (
                <p key={index} className="block bg-slate-100 text-slate-500 text-center border border-slate-400 py-1 max-[420px]:px-1 px-2 mt-1 w-full rounded-xl">
                  {option.data}
                </p>
              )
            ))}
          </div>
          {data[0]?.paymentMethod === "Dólares" && (
            <>
              <div className="mb-1">
                <label htmlFor="photoTicket" className="block text-slate-700 font-medium mb-1">
                  Foto del Billete:
                </label>
                <div className="grid grid-cols-1">
                  <div className="relative">
                    <Image
                      src={file ? URL.createObjectURL(file) : ImageNotSupported}
                      className="rounded-md drop-shadow-6xl m-auto h-fit"
                      alt={data[0]?.name}
                      width={200} height={200}
                    />
                    <label className="text-xs absolute max-[420px]:top-1/3 top-2/3 left-0 w-full">
                      <span className="bg-blue-500 hover:bg-blue-500 text-white py-1 px-3 rounded-xl shadow-6xl mx-auto w-fit cursor-pointer block">Subir</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="photoTicket"
                        name="photoTicket"
                        className="bg-white py-1 px-2 rounded-md"
                        onChange={handleChange2}
                        style={{ display: "none" }}
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="bg-white p-2 rounded-xl shadow-6xl max-[420px]:mb-2 h-fit w-full col-start-7 col-end-9">
          <div className="mb-1">
            <label htmlFor="deliveryMethod" className="block text-slate-700 font-medium mb-1">
              Forma de Entrega:
            </label>
            <select
              id="deliveryMethod"
              name="deliveryMethod"
              value={data[0]?.deliveryMethod}
              onChange={handleChange}
              className="bg-slate-100 text-center border border-slate-400 py-1 px-2 w-full rounded-xl"
              required
            >
              <option value="">Seleccione una opción</option>
              {dataCheckout[1][0]?.map((option, index) => (
                <option key={index} value={option.name}>{option.name}</option>
              ))}
            </select>
            {dataCheckout[1][0]?.map((option, index) => (
              data[0]?.deliveryMethod === option.name && (
                <p key={index} className="block bg-slate-100 text-slate-500 text-center border border-slate-400 py-1 max-[420px]:px-1 px-2 mt-1 w-full rounded-xl">
                  {option.data?.length === 1 && !isNaN(option.data)
                    ? `${option.data}$`
                    : option.data}
                </p>
              )
            ))}
          </div>
          {data[0]?.deliveryMethod?.includes("Delivery") && (
            <>
              <div className="mb-1">
                <p className="block text-slate-700 font-medium mb-1">
                  Ubicate en el Mapa:
                </p>
                {data[0].latitude && data[0].longitude ? (
                  <div className="m-auto h-48 w-48">
                    <Maps
                      latitude={data[0]?.latitude}
                      longitude={data[0]?.longitude}
                      onPositionChange={handlePositionChange} />
                  </div>
                ) : (
                  <p className="text-center m-auto">Cargando ubicación...</p>
                )}
              </div>
              <div className="mb-1">
                <label htmlFor="address" className="block text-slate-700 font-medium mb-1">
                  Notas de Dirección:
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Puntos de Referencia, etc."
                  value={data[0]?.address || ""}
                  onChange={handleChange}
                  className="bg-slate-100 text-center border border-slate-400 py-1 px-2 w-full rounded-xl"
                  required />
              </div>
            </>
          )}
        </div>

        {data[0]?.deliveryMethod?.includes("Delivery") && (
          <div className="bg-white p-2 rounded-xl shadow-6xl h-fit w-full col-start-3 col-end-7 mb-2">
            <label className="block text-slate-700 font-medium mb-1">
              Fecha de Entrega:
            </label>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
            >
              {deliveryDate
                ? moment(deliveryDate).format("dddd, D [de] MMMM [a las] HH:mm")
                : "Seleccionar día y hora"}
            </button>

            {showDatePicker && (
              <div className="mt-2 border border-slate-300 rounded p-2 bg-white shadow-md">
                <input
                  type="date"
                  className="border px-2 py-1 rounded mb-2 w-full"
                  min={moment().format("YYYY-MM-DD")}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedHour("");
                  }}
                  required
                />
                {selectedDate && (
                  <select
                    className="w-full border px-2 py-1 rounded"
                    value={selectedHour}
                    onChange={(e) => {
                      setSelectedHour(e.target.value);
                      const combined = moment(`${selectedDate} ${e.target.value}`, "YYYY-MM-DD HH:mm");
                      setDeliveryDate(combined.toISOString());
                      setShowDatePicker(false);
                    }}
                    required
                  >
                    <option value="">Selecciona la hora</option>
                    {allowedHours.map((hour) => {
                      const label = moment(hour, "HH:mm").format("h:mm A");
                      return (
                        <option key={hour} value={hour}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-600 hover:bg-blue-600 text-xl font-bold text-white py-1 px-2 rounded-xl shadow-6xl mb-2 mx-auto w-fit col-start-1 col-end-9 block ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isSubmitting ? "Enviando..." : "Enviar Pedido"}
        </button>
      </div>
      {
        isFreeDelivery && data[0]?.deliveryMethod?.includes("Delivery") && showFreeDeliveryModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gradient-to-br from-pink-200 via-yellow-100 to-green-200 p-6 rounded-2xl shadow-2xl max-w-sm text-center border-4 border-yellow-300 animate-pulse">
              <h2 className="text-2xl font-bold text-green-700 mb-2">¡Felicidades! 🎉</h2>
              <p className="text-lg text-slate-800">
                Tu pedido tiene <strong>Delivery Gratis</strong> por superar {freeDeliveryLimit}$.
              </p>
              <p className="mt-2 text-slate-600">
                Solo elige la opción de entrega que desees para continuar.
              </p>
              <button
                onClick={() => setShowFreeDeliveryModal(false)}
                className="mt-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 shadow-md"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        )
      }
    </form >
    // ===END_RETURN===
  )
}