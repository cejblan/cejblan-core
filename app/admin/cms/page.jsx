"use client";

import { useEffect, useState } from "react";
import Editor from "./Lienzo";

export default function CMS() {
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.files) && data.files.length > 0) {
          setArchivos(data.files);
          setArchivoSeleccionado(data.files[0]);
        } else {
          setArchivos([]);
          setArchivoSeleccionado("");
        }
      })
      .catch(() => {
        setArchivos([]);
        setArchivoSeleccionado("");
      })
      .finally(() => setLoading(false));
  }, []);

  const crearArchivoNuevo = () => {
    const nombre = prompt("Nombre del nuevo archivo (ej: nuevo.html):");
    if (!nombre || !nombre.trim()) return;

    // Redirigir o actualizar estado para que use nuevo archivo
    setArchivoSeleccionado(nombre);
    setArchivos((prev) => [...prev, nombre]);
  };

  if (loading) return <p>Cargando archivos...</p>;

  return (
    <div>
      {archivos.length > 0 ? (
        <>
          <select
            value={archivoSeleccionado}
            onChange={(e) => setArchivoSeleccionado(e.target.value)}
          >
            {archivos.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
          {archivoSeleccionado && <Editor file={archivoSeleccionado} />}
          <button onClick={crearArchivoNuevo} style={{ marginTop: "1rem" }}>
            Crear nuevo archivo
          </button>
        </>
      ) : (
        <>
          <p>No hay archivos creados.</p>
          <button onClick={crearArchivoNuevo}>Crear primer archivo</button>
        </>
      )}
    </div>
  );
}
