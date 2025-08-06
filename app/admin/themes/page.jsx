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
  const [loadingStyle, setLoadingStyle] = useState(""); // <-- Nuevo estado
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
        setLoadingStyle(data.loading || ""); // <-- Inicializar
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

  if (loading) return <p style={{ padding: 20 }}>Cargando tema actual...</p>;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
        Configuración de Tema
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Logo del sitio:
          </label>
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="URL del logo"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Navbar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Navbar Seleccionado:
          </label>
          <select
            value={navbar}
            onChange={(e) => setNavbar(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
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
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Footer Seleccionado:
          </label>
          <select
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
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
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Loading Seleccionado:
          </label>
          <select
            value={loadingStyle}
            onChange={(e) => setLoadingStyle(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
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
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>
            Paleta de colores:
          </h3>
          {palette.map((color, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <label style={{ minWidth: 70 }}>Color {i + 1}:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.4rem",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
            </div>
          ))}
        </div>

        {/* Botón submit */}
        <button
          type="submit"
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#1e293b",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Guardar cambios
        </button>

        {message && (
          <p style={{ marginTop: "1rem", color: "green", fontWeight: "bold" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
