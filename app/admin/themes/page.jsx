"use client";

import { useEffect, useState } from "react";

export default function ThemesPage() {
  const [palette, setPalette] = useState([]);
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Obtener datos actuales
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/branding");
        const data = await res.json();
        setPalette(data.palette || []);
        setLogo(data.logo || "");
      } catch (err) {
        console.error("Error al cargar branding:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Cambiar color individual
  const updateColor = (index, value) => {
    const newPalette = [...palette];
    newPalette[index] = value;
    setPalette(newPalette);
  };

  // Enviar al servidor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ palette, logo }),
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

  if (loading) return <p>Cargando tema actual...</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: 600 }}>
      <h1>Configuración de Tema</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <label>
          Logo del sitio:
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="URL del logo"
            style={{ width: "100%", marginTop: 4 }}
            required
          />
        </label>

        <div style={{ marginTop: "1.5rem" }}>
          <h3>Paleta de colores:</h3>
          {palette.map((color, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <label>Color {i + 1}: </label>
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#1e293b",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Guardar cambios
        </button>

        {message && (
          <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>
        )}
      </form>
    </div>
  );
}
