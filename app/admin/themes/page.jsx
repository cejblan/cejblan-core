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
        <button
          type="submit"
          className="bg-slate-700 hover:bg-slate-600 text-white cursor-pointer py-2 px-4 rounded-lg"
        >
          Guardar cambios
        </button>

        {message && (
          <p className="mt-4 text-green-600 font-bold">{message}</p>
        )}
      </form>
    </div>
  );
}
