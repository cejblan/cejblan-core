"use client"

import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { RiUserFill } from "react-icons/ri";
import { TfiEmail } from "react-icons/tfi";
import { FaMobileAlt, FaTelegram } from "react-icons/fa";
import { FaLocationDot, FaMapLocationDot, FaArrowRightArrowLeft } from "react-icons/fa6";
import Loading from "@/components/editable/Loading";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import Geolocation from "@/components/Geolocation";
import dynamic from "next/dynamic";
// Cargar Maps dinámicamente con un componente de carga y desactiva SSR
const Maps = dynamic(() => import("@/components/Maps"), {
  loading: () => <Loading zIndex={40} />,
  ssr: false, // Solo si necesitas que se cargue solo en el lado del cliente
});

export default function Profile() {
  const { data: session, status } = useSession();
  const [edit, setEdit] = useState(false); // Estado para modo edición
  const [code, setCode] = useState(false);
  const [initialTime, setInitialTime] = useState(false);
  const { latitude, longitude } = Geolocation() || {};
  const [latitudeNew, setLatitude] = useState();
  const [longitudeNew, setLongitude] = useState();
  const [isLoading, setIsLoading] = useState(true); // Estado para verificar si los datos están cargando
  const [dataProfile, setData] = useState([
    {
      phoneCode: "412",
      phoneNumber: "",
      phoneCodeDos: "",
      phoneNumberDos: "",
      address: ""
    }
  ]); // Estado para almacenar los datos del usuario
  const showPhoneNumber = Number("+58" + dataProfile[0]?.phoneCode + "" + dataProfile[0]?.phoneNumber);
  const showPhoneNumber2 = Number("+58" + dataProfile[0]?.phoneCodeDos + "" + dataProfile[0]?.phoneNumberDos);
  const handleChange = (e) => {
    setData([
      {
        ...dataProfile[0], // Accede al primer elemento del array
        [e.target.name]: e.target.value,
      }
    ]);
  };
  // Callback para actualizar la posición directamente desde el componente Maps
  const handlePositionChange = (newPosition) => {
    // Limita la longitud a 6 decimales convirtiendo a string y luego de nuevo a número
    const latitudeTruncated = parseFloat(newPosition[0].toFixed(7, 4));
    const longitudeTruncated = parseFloat(newPosition[1].toFixed(7, 4));
    setLatitude(latitudeTruncated);
    setLongitude(longitudeTruncated);
  };
  // Agrega este useEffect para establecer valores iniciales de geolocalización
  useEffect(() => {
    if (latitude && longitude) {
      setLatitude(latitude);
      setLongitude(longitude);
    }
  }, [latitude, longitude]);

  const loadData = useCallback(async () => {
    try {
      const response = await fetch(`/api/profile?customerEmail=${encodeURIComponent(session.user.email)}`, {
        method: "GET",
      });

      const dataProfile = await response.json();

      if (response.ok) {
        setData(dataProfile); // Guardar datos en el estado
      } else {
        console.error("Error:", dataProfile.error);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false); // Indica que los datos han cargado
    }
  }, [session?.user?.email]); // ← solo depende del email

  useEffect(() => {
    if (session?.user?.email) {
      loadData();
    }
  }, [session, loadData]);

  const dataSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session.user.name,
          email: session.user.email,
          phoneCode: dataProfile[0].phoneCode,
          phoneNumber: dataProfile[0].phoneNumber,
          phoneCodeDos: dataProfile[0].phoneCodeDos,
          phoneNumberDos: dataProfile[0].phoneNumberDos,
          address: dataProfile[0].address,
          latitude: latitudeNew,
          longitude: longitudeNew,
        }),
      });

      const profileData = await response.json();

      if (response.ok) {
        setData(profileData);
      } else {
        console.error("Error:", profileData.error);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
    window.location.reload();
  };

  async function editData() {
    setEdit(true);
  }

  async function codeVerified() {
    const aleatorio = Math.floor(Math.random() * 999999);
    const aleatorio6Digitos = aleatorio.toString().padStart(6, "0");
    setCode(aleatorio6Digitos);
    try {
      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          code: aleatorio6Digitos,
        }),
      });

      const profileData = await response.json();

      if (response.ok) {
        setInitialTime(59); // Configurar el tiempo inicial a 59 segundos
      } else {
        console.error("Error:", profileData.error);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }

  if (isLoading) {
    return <Loading zIndex={40} />;
  }

  return (
    // ===START_RETURN===
    <div className="py-6">
      <div className="bg-white text-start tracking-tighter py-2 rounded-xl mx-auto max-[420px]:w-full w-fit">
        <Image src={session?.user.image}
          alt="Imagen de Usuario"
          className="rounded-full mb-1 mx-auto cursor-pointer"
          width={100} height={100} />
        {
          status === "authenticated" && dataProfile[0]?.verified === 0 ?
            <div className="font-semibold text-2xl pt-2 max-[420px]:px-2 px-4">
              <h2 className="text-center">
                Necesitamos enlazar su perfil con nuestro:
              </h2>
              <div className="text-center mt-2 max-[420px]:flex grid grid-cols-2 gap-2 justify-center items-center">
                <div className="my-3 mx-auto w-fit grid grid-cols-1 justify-center items-center">
                  <span className="flex justify-center items-center">
                    <span className="text-xl">Bot de&nbsp;</span>
                    <span className="text-[#6ed8bf] font-bold">Telegram</span>
                    <FaTelegram className="text-[#6ed8bf] h-4 w-4" />
                  </span>
                  <Link href={`https://t.me/${process.env.BOT_NAME}`} className="text-xl text-[#6ed8bf] hover:text-[#4bb199] underline" target="_blank">@{process.env.BOT_NAME}</Link>
                </div>
                {
                  code ?
                    <div className="mx-auto grid grid-cols-1">
                      <p className="bg-[#6ed8bf] text-3xl text-white text-center font-bold tracking-wide px-1 rounded-xl shadow-6xl mx-auto h-fit w-fit block">
                        {code}
                      </p>
                      <div className="text-xl my-1">
                        {initialTime && (
                          <Countdown
                            initialTime={initialTime}
                            onTimeUp={() => setCode(null)}
                          />
                        )}
                      </div>
                    </div>
                    :
                    <button
                      className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white py-1 px-2 rounded-xl shadow-6xl mx-auto h-fit w-fit block"
                      onClick={codeVerified}
                    >
                      Generar
                    </button>
                }
              </div>

            </div>
            :
            status === "authenticated" && !edit ?
              <>
                <table className="max-[420px]:text-base text-xl text-gray-800 table-auto border-collapse max-[420px]:w-full">
                  <tbody>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <RiUserFill />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p>{session?.user.name}</p>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <TfiEmail />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p>{session?.user.email}</p>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <FaMobileAlt />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p>
                          {
                            showPhoneNumber ?
                              "+" + showPhoneNumber
                              :
                              <span className="text-gray-400">Sin #celular</span>
                          }
                        </p>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <FaMobileAlt />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p>
                          {
                            showPhoneNumber2 ?
                              "+" + showPhoneNumber2
                              :
                              <span className="text-gray-400">Sin #celular secundario</span>
                          }
                        </p>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <FaLocationDot />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p>
                          {dataProfile[0]?.address || <span className="text-gray-400">Sin dirección</span>}
                        </p>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <FaMapLocationDot />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p>
                          Latitud: {dataProfile[0]?.latitude || <span className="text-gray-400">Sin geolocalización</span>}
                        </p>
                        <p>
                          Longitud: {dataProfile[0]?.longitude || <span className="text-gray-400">Sin geolocalización</span>}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button
                  className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white font-bold py-1 px-2 rounded-xl shadow-6xl mt-2 mx-auto block"
                  onClick={editData}>
                  Editar Perfil
                </button>
              </>
              :
              <form onSubmit={dataSubmit}>
                <table className="max-[420px]:text-base text-lg text-gray-800 table-auto border-collapse max-[420px]:w-full">
                  <tbody>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <RiUserFill />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p className="block bg-gray-100 text-gray-600 text-center border border-gray-400 py-1 max-[420px]:px-1 px-2 w-full rounded-xl">
                          {session?.user.name}
                        </p>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <TfiEmail />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p className="block bg-gray-100 text-gray-600 text-center border border-gray-400 py-1 max-[420px]:px-1 px-2 w-full rounded-xl">
                          {session?.user.email}
                        </p>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2  h-8">
                        <FaMobileAlt />
                      </td>
                      <td className="py-1 pl-2 pr-4 flex">
                        <select
                          id="phoneCode"
                          name="phoneCode"
                          onChange={handleChange}
                          defaultValue={dataProfile[0]?.phoneCode}
                          className="bg-gray-100 text-center border border-gray-400 py-1 px-2 mr-1 w-fit rounded-xl"
                          required
                        >
                          <option value="">--</option>
                          <option value="412">0412</option>
                          <option value="414">0414</option>
                          <option value="424">0424</option>
                          <option value="416">0416</option>
                          <option value="426">0426</option>
                        </select>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="text"
                          maxLength="7"
                          placeholder="#Celular"
                          value={dataProfile[0]?.phoneNumber || ""}
                          onChange={handleChange}
                          className="bg-gray-100 text-center border border-gray-400 py-1 px-2 w-full rounded-xl"
                          required
                        />
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <FaMobileAlt />
                      </td>
                      <td className="py-1 pl-2 pr-4 flex">
                        <select
                          id="phoneCodeDos"
                          name="phoneCodeDos"
                          onChange={handleChange}
                          defaultValue={dataProfile[0]?.phoneCodeDos}
                          className="bg-gray-100 text-center border border-gray-400 py-1 px-2 mr-1 w-fit rounded-xl"
                        >
                          <option value="">--</option>
                          <option value="412">0412</option>
                          <option value="414">0414</option>
                          <option value="424">0424</option>
                          <option value="416">0416</option>
                          <option value="426">0426</option>
                        </select>
                        <input
                          type="text"
                          id="phoneNumberDos"
                          name="phoneNumberDos"
                          placeholder="#Celular Secundario"
                          value={dataProfile[0]?.phoneNumberDos || ""}
                          maxLength="7"
                          onChange={handleChange}
                          className="bg-gray-100 text-center border border-gray-400 py-1 px-2 w-full rounded-xl"
                        />
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <FaLocationDot />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <textarea
                          id="address"
                          name="address"
                          placeholder="Ingresa tu dirección, incluye puntos de referencia"
                          value={dataProfile[0]?.address || ""}
                          onChange={handleChange}
                          className="bg-gray-100 text-center border border-gray-400 py-1 px-2 w-full rounded-xl"
                          required
                        />
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300">
                      <td className="text-slate-600 pl-4 pr-2">
                        <FaMapLocationDot />
                      </td>
                      <td className="py-1 pl-2 pr-4">
                        <p className="flex">
                          <span className="min-w-9">Latitud:</span>
                          <span className="block bg-gray-100 text-gray-600 text-center border border-gray-400 py-1 max-[420px]:px-1 px-2 w-full rounded-xl">
                            {latitudeNew || dataProfile[0]?.latitude || latitude || "No disponible"}
                          </span>
                        </p>
                        <p className="flex">
                          <span className="min-w-9">Longitud:</span>
                          <span className="block bg-gray-100 text-gray-600 text-center border border-gray-400 py-1 max-[420px]:px-1 px-2 w-full rounded-xl">
                            {longitudeNew || dataProfile[0]?.longitude || longitude || "No disponible"}
                          </span>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {latitude && longitude ? (
                  <div className="m-auto h-48 w-full">
                    <Maps
                      latitude={dataProfile[0]?.latitude || latitude}
                      longitude={dataProfile[0]?.longitude || longitude}
                      onPositionChange={handlePositionChange} />
                  </div>
                ) : (
                  <p className="text-center m-auto">Cargando ubicación...</p>
                )}
                <button
                  className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white font-bold py-1 px-2 rounded-xl shadow-6xl mt-2 mx-auto block"
                  onClick={dataSubmit}>
                  Guardar Datos
                </button>
              </form>
        }
      </div>
    </div>
    // ===END_RETURN===
  )
}