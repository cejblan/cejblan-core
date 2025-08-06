"use client";

import { useEffect, useState } from "react";

const NAVBAR_OPTIONS = ["navbar1", "navbar2", "navbar3"];
const FOOTER_OPTIONS = ["footer1", "footer2", "footer3"];
const LOADING_OPTIONS = ["loading1", "loading2", "loading3"];

export default function ThemesPage() {
  const [palette, setPalette] = useState([]);
  const [logo, setLogo] = useState("");
  const [navbar, setNavbar] = useState("");
  const [footer, setFooter] = useState("");
  const [loadingStyle, setLoadingStyle] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [mostrarConfirmacionMerge, setMostrarConfirmacionMerge] = useState(false);
  const [errorMerge, setErrorMerge] = useState('');
  const [mostrandoErrorMerge, setMostrandoErrorMerge] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/branding");
        const data = await res.json();
        setPalette(data.palette || []);
        setLogo(data.logo || "");
        setNavbar(data.navbar || "");
        setFooter(data.footer || "");
        setLoadingStyle(data.loading || "");
      } catch (err) {
        console.error("Error al cargar branding:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
        body: JSON.stringify({ palette, logo, navbar, footer, loading: loadingStyle }),
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

  if (loading) return <p className="p-5">Cargando tema actual...</p>;

  return (
    <div className="p-8 max-w-[700px] mx-auto font-sans">
      <h1 className="text-[1.8rem] mb-6 font-bold">Configuración de Tema</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 border border-gray-300 rounded-lg p-8 shadow-md"
      >
        {/* Logo */}
        <div className="mb-6">
          <label className="block font-bold mb-1">Logo del sitio:</label>
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="URL del logo"
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>

        {/* Navbar */}
        <div className="mb-6">
          <label className="block font-bold mb-1">Navbar Seleccionado:</label>
          <select
            value={navbar}
            onChange={(e) => setNavbar(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          >
            <option value="">Selecciona uno</option>
            {NAVBAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className="mb-6">
          <label className="block font-bold mb-1">Footer Seleccionado:</label>
          <select
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          >
            <option value="">Selecciona uno</option>
            {FOOTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        <div className="mb-6">
          <label className="block font-bold mb-1">Loading Seleccionado:</label>
          <select
            value={loadingStyle}
            onChange={(e) => setLoadingStyle(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          >
            <option value="">Selecciona uno</option>
            {LOADING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Colores */}
        <div className="mb-6">
          <h3 className="text-[1.1rem] mb-2 font-semibold">Paleta de colores:</h3>
          {palette.map((color, i) => (
            <div
              key={i}
              className="flex items-center gap-2 mb-2"
            >
              <label className="min-w-[70px]">Color {i + 1}:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
                className="flex-1 p-1.5 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>

        {/* Botón */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-slate-700 hover:bg-slate-600 text-white cursor-pointer py-2 px-4 rounded-lg"
          >
            Guardar cambios
          </button>
          <span
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold cursor-pointer"
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
    </div>
  );
}
