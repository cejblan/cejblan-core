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
// Carga el componente Maps dinámicamente y desactiva SSR
const Maps = dynamic(() => import("../Maps"), { ssr: false });

export default function Checkout() {
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

    const deliveryMethodData = dataCheckout[1][0].find(option => option.name === data[0]?.deliveryMethod);

    if (deliveryMethodData) {
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
          <p className="text-lg text-slate-700 font-semibold mt-1">Total: {totalPrice}$</p>
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
                  {option.data}
                </p>
              )
            ))}
          </div>
          {data[0]?.deliveryMethod === "Delivery" && (
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
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-600 hover:bg-blue-600 text-xl font-bold text-white py-1 px-2 rounded-xl shadow-6xl mb-2 mx-auto w-fit col-start-1 col-end-9 block ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isSubmitting ? "Enviando..." : "Enviar Pedido"}
        </button>
      </div>
    </form >
    // ===END_RETURN===
  )
}