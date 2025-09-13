"use client";

import { useEffect, useState } from "react";
import ImageNotSupported from "@/public/ImageNotSupported.webp";
import GaleriaModal from "@/app/admin/components/GaleriaModal";

export default function ThemesPage() {
  const [palette, setPalette] = useState([]);
  const [logo, setLogo] = useState("");
  const [logo2, setLogo2] = useState("");
  const [logo3, setLogo3] = useState("");
  const [fondo, setFondo] = useState("");
  const [img404, setImg404] = useState("");
  const [img500, setImg500] = useState("");
  const [navbar, setNavbar] = useState("");
  const [footer, setFooter] = useState("");
  const [loadingStyle, setLoadingStyle] = useState("");
  const [background, setBackground] = useState("none");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [mostrarConfirmacionMerge, setMostrarConfirmacionMerge] = useState(false);
  const [errorMerge, setErrorMerge] = useState('');
  const [mostrandoErrorMerge, setMostrandoErrorMerge] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);

  // opciones dinámicas leídas desde components/editable vía API
  const [navbarOptions, setNavbarOptions] = useState([]);
  const [footerOptions, setFooterOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/branding");
        const data = await res.json();
        setPalette(data.palette || []);
        setLogo(data.logo || "");
        setLogo2(data.logo2 || "");
        setLogo3(data.logo3 || "");
        setFondo(data.fondo || "");
        setImg404(data.img404 || "");
        setImg500(data.img500 || "");
        setNavbar(data.navbar || "");
        setFooter(data.footer || "");
        setLoadingStyle(data.loading || "");
        setBackground(data.background || "none");
      } catch (err) {
        console.error("Error al cargar branding:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchOptions() {
      try {
        const res = await fetch("/api/branding/options");
        if (!res.ok) {
          console.warn("No se pudieron cargar opciones dinámicas (status " + res.status + ")");
          return;
        }
        const data = await res.json();
        setNavbarOptions(Array.isArray(data.navbar) ? data.navbar : []);
        setFooterOptions(Array.isArray(data.footer) ? data.footer : []);
        setLoadingOptions(Array.isArray(data.loading) ? data.loading : []);
      } catch (err) {
        console.error("Error al cargar opciones dinámicas:", err);
      }
    }

    fetchData();
    fetchOptions();
  }, []);

  const updateColor = (index, value) => {
    const newPalette = [...palette];
    newPalette[index] = value;
    setPalette(newPalette);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          palette,
          logo,
          logo2,
          logo3,
          fondo,
          img404,
          img500,
          navbar,
          footer,
          loading: loadingStyle,
          background,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("¡Tema actualizado correctamente!");
      } else {
        setMessage("Error: " + result.error);
      }
    } catch (err) {
      setMessage("Error al guardar cambios.");
    }
  };

  const handleSelectFromGaleria = (url) => {
    if (!imagenSeleccionada) {
      setLogo(url);
    } else if (imagenSeleccionada === "logo") {
      setLogo(url);
    } else if (imagenSeleccionada === "logo2") {
      setLogo2(url);
    } else if (imagenSeleccionada === "logo3") {
      setLogo3(url);
    } else if (imagenSeleccionada === "fondo") {
      setFondo(url);
    } else if (imagenSeleccionada === "img404") {
      setImg404(url);
    } else if (imagenSeleccionada === "img500") {
      setImg500(url);
    }
    setGaleriaAbierta(false);
    setImagenSeleccionada(null);
  };

  if (loading) return <p className="p-5">Cargando tema actual...</p>;

  return (
    <div className="py-4 px-2 md:px-4 mx-auto font-sans">
      <h1 className="text-[1.8rem] mb-6 font-bold">Configuración de Tema</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-md"
      >
        <div className="mb-6 grid md:grid-cols-6 gap-2">
          {/* Logos / fondo / 404 / 500 */}
          <div className="p-2 bg-gray-100 border rounded-xl">
            <p className="mb-1 font-semibold">Logo 1:</p>
            <div
              className="w-full aspect-square bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition relative cursor-pointer"
              onClick={() => {
                setImagenSeleccionada("logo");
                setGaleriaAbierta(true);
              }}
            >
              <img
                src={logo || ImageNotSupported.src}
                alt="Logo del sitio"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ImageNotSupported.src;
                }}
              />
            </div>
          </div>

          <div className="p-2 bg-gray-100 border rounded-xl">
            <p className="mb-1 font-semibold">Logo 2:</p>
            <div
              className="w-full aspect-square bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition relative cursor-pointer"
              onClick={() => {
                setImagenSeleccionada("logo2");
                setGaleriaAbierta(true);
              }}
            >
              <img
                src={logo2 || ImageNotSupported.src}
                alt="Logo alternativo"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ImageNotSupported.src;
                }}
              />
            </div>
          </div>

          <div className="p-2 bg-gray-100 border rounded-xl">
            <p className="mb-1 font-semibold">Logo 3:</p>
            <div
              className="w-full aspect-square bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition relative cursor-pointer"
              onClick={() => {
                setImagenSeleccionada("logo3");
                setGaleriaAbierta(true);
              }}
            >
              <img
                src={logo3 || ImageNotSupported.src}
                alt="Logo 3"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ImageNotSupported.src;
                }}
              />
            </div>
          </div>

          <div className="p-2 bg-gray-100 border rounded-xl">
            <p className="mb-1 font-semibold">Fondo:</p>
            <div
              className="w-full aspect-square bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition relative cursor-pointer"
              onClick={() => {
                setImagenSeleccionada("fondo");
                setGaleriaAbierta(true);
              }}
            >
              <img
                src={fondo || ImageNotSupported.src}
                alt="Imagen de fondo"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ImageNotSupported.src;
                }}
              />
            </div>
          </div>

          <div className="p-2 bg-gray-100 border rounded-xl">
            <p className="mb-1 font-semibold">Imagen 404:</p>
            <div
              className="w-full aspect-square bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition relative cursor-pointer"
              onClick={() => {
                setImagenSeleccionada("img404");
                setGaleriaAbierta(true);
              }}
            >
              <img
                src={img404 || ImageNotSupported.src}
                alt="Imagen 404"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ImageNotSupported.src;
                }}
              />
            </div>
          </div>

          <div className="p-2 bg-gray-100 border rounded-xl">
            <p className="mb-1 font-semibold">Imagen 500:</p>
            <div
              className="w-full aspect-square bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition relative cursor-pointer"
              onClick={() => {
                setImagenSeleccionada("img500");
                setGaleriaAbierta(true);
              }}
            >
              <img
                src={img500 || ImageNotSupported.src}
                alt="Imagen 500"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ImageNotSupported.src;
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-6 grid md:grid-cols-4 gap-2">
          <div>
            <label className="block font-bold mb-1">Navbar:</label>
            <select
              value={navbar}
              onChange={(e) => setNavbar(e.target.value)}
              className="text-center w-full p-2 mt-1 border border-gray-300 rounded"
            >
              <option value="">Selecciona uno</option>
              {navbarOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Footer:</label>
            <select
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              className="text-center w-full p-2 mt-1 border border-gray-300 rounded"
            >
              <option value="">Selecciona uno</option>
              {footerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Loading:</label>
            <select
              value={loadingStyle}
              onChange={(e) => setLoadingStyle(e.target.value)}
              className="text-center w-full p-2 mt-1 border border-gray-300 rounded"
            >
              <option value="">Selecciona uno</option>
              {loadingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-1">Background:</label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="text-center w-full p-2 mt-1 border border-gray-300 rounded"
            >
              <option value="none">Ninguno</option>
              <option value="all">En todo el sitio</option>
              <option value="home">Solo en Inicio</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-[1.1rem] mb-2 font-semibold">Paleta de colores:</h3>
          <div className="grid grid-cols-3 items-center gap-2">
            {palette.map((color, i) => (
              <div key={i} className="md:flex items-center gap-2">
                <label className="min-w-[70px]">Color {i + 1}:</label>
                <input type="color" value={color} onChange={(e) => updateColor(i, e.target.value)} />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="p-1 border border-gray-300 rounded w-10"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-base md:text-xl flex gap-2">
          <button
            type="submit"
            className="bg-slate-700 hover:bg-slate-600 text-white cursor-pointer py-1 px-2 rounded-lg ml-auto"
          >
            Guardar cambios
          </button>
          <span
            className="w-full sm:w-auto py-1 px-2 rounded-lg mr-auto bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
            onClick={() => setMostrarConfirmacionMerge(true)}
          >
            Publicar en producción
          </span>
        </div>

        {mostrarConfirmacionMerge && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white border-4 border-red-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                ⚠️ ¡Advertencia crítica!
              </h2>
              <p className="text-gray-800 mb-4">
                Esta acción enviará los cambios de <strong className="text-[#6ed8bf]">develop</strong> a <strong className="text-black">main</strong> y no se puede deshacer.
              </p>
              <p className="text-lg font-semibold text-red-600 mb-6">
                ¿Estás absolutamente seguro de que deseas continuar?
              </p>
              <div className="flex justify-end gap-4">
                <span
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                  onClick={() => setMostrarConfirmacionMerge(false)}
                >
                  Cancelar
                </span>
                <span
                  className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 cursor-pointer"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/github/merge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ from: 'develop', to: 'main' }),
                      });

                      if (!res.ok) {
                        const error = await res.text();
                        throw new Error(error);
                      }

                      setMostrarConfirmacionMerge(false);
                      alert("🚀 ¡Publicado en producción con éxito!");
                    } catch (error) {
                      setMostrarConfirmacionMerge(false);
                      setErrorMerge("❌ El merge ha fallado.\n\nLa rama `main` parece haber sido modificada directamente.\nEsto rompe el protocolo de despliegue.\n\n🛑 ¡DETÉN TODO Y CONTACTA AL ADMINISTRADOR YA MISMO!");
                      setMostrandoErrorMerge(true);
                    }
                  }}
                >
                  Sí, publicar ahora
                </span>
              </div>
            </div>
          </div>
        )}

        {mostrandoErrorMerge && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white border-4 border-red-800 p-6 rounded-lg w-full max-w-lg shadow-2xl">
              <h2 className="text-xl font-bold text-red-800 mb-4">🛑 Error Grave</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line mb-6">{errorMerge}</p>
              <div className="text-right">
                <span
                  className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 cursor-pointer"
                  onClick={() => setMostrandoErrorMerge(false)}
                >
                  Entendido
                </span>
              </div>
            </div>
          </div>
        )}

        {message && (
          <p className="mt-4 text-green-600 font-bold">{message}</p>
        )}
      </form>

      <GaleriaModal
        abierto={galeriaAbierta}
        onClose={() => {
          setGaleriaAbierta(false);
          setImagenSeleccionada(null);
        }}
        onSelect={handleSelectFromGaleria}
      />
    </div>
  );
}
