"use client";

import { useEffect, useState } from "react";
import Editor from "./Lienzo";

export default function CMS() {
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState("");
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [contenidoArchivo, setContenidoArchivo] = useState('');

  // Cargar lista de archivos desde GitHub (solo una vez al montar)
  useEffect(() => {
    fetch('/api/github/list')
      .then(res => res.json())
      .then(data => {
        if (data.files?.length) {
          setArchivos(data.files);
          setArchivoSeleccionado(data.files[0]);
        }
      });
  }, []);

  // Cargar contenido cuando cambie archivo seleccionado
  useEffect(() => {
    if (!archivoSeleccionado) return;

    const obtenerContenido = async () => {
      const res = await fetch('/api/github/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: archivoSeleccionado }),
      });

      const data = await res.json();
      if (data.content) {
        setContenidoArchivo(data.content);  // Guardamos para pasar al editor
      }
    };

    obtenerContenido();
  }, [archivoSeleccionado]);

  const nuevoArchivo = async () => {
    const nombre = prompt("Nombre del nuevo archivo (ej: nuevo.html):");
    if (!nombre || !nombre.trim()) return;

    try {
      await fetch("/api/cms/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: nombre.trim(), content: "" }),
      });

      setArchivos((prev) => [nombre.trim(), ...prev]);
      setArchivoSeleccionado(nombre.trim());
      window.history.replaceState(null, "", `?file=${nombre.trim()}`);
    } catch (err) {
      console.error("Error al crear archivo:", err);
    }
  };

  const commitsMock = [
    "commit 1 - 2024-07-01",
    "commit 2 - 2024-06-30",
    "commit 3 - 2024-06-29",
    "commit 4 - 2024-06-28",
    "commit 5 - 2024-06-27",
    "commit 6 - 2024-06-26",
    "commit 7 - 2024-06-25",
    "commit 8 - 2024-06-24",
    "commit 9 - 2024-06-23",
  ];

  if (!archivos.length) {
    return (
      <div className="text-center mt-10">
        <p className="mb-4 text-gray-700">No hay archivos disponibles.</p>
        <button
          onClick={nuevoArchivo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
        >
          Crear nuevo archivo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <select
          value={archivoSeleccionado}
          onChange={(e) => setArchivoSeleccionado(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {archivos.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>

        <button
          onClick={nuevoArchivo}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
        >
          Nuevo archivo
        </button>

        <button
          onClick={() => setMostrarHistorial(true)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition text-sm"
        >
          Ver historial
        </button>
      </div>

      {archivoSeleccionado && (<Editor file={archivoSeleccionado} contenido={contenidoArchivo} />)}

      {mostrarHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Historial de versiones</h2>

            <div className="flex gap-2 items-center">
              <select className="flex-1 border rounded p-2">
                {commitsMock.map((c, i) => (
                  <option key={i}>{c}</option>
                ))}
              </select>
              <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm">
                Retomar versión anterior
              </button>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setMostrarHistorial(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
