"use client";

import { useEffect, useState } from "react";
import Editor from "./Lienzo";

export default function CMS() {
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState("");
  const [contenidoArchivo, setContenidoArchivo] = useState('');
  const [historialCommits, setHistorialCommits] = useState([]);
  const [mostrandoHistorial, setMostrandoHistorial] = useState(false);
  const [commitSeleccionado, setCommitSeleccionado] = useState('');

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

  const cargarHistorial = async () => {
    if (!archivoSeleccionado) return;

    const res = await fetch(`/api/github/commits?file=${archivoSeleccionado}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setHistorialCommits(data.slice(0, 9)); // últimos 9 commits
    } else {
      console.error("Respuesta inválida al cargar historial");
    }
  };

  const retomarDesdeCommit = async () => {
    if (!commitSeleccionado || !archivoSeleccionado) return;

    const res = await fetch(`/api/github/file?path=${archivoSeleccionado}&sha=${commitSeleccionado}`);
    const data = await res.json();

    if (data?.content) {
      setContenidoArchivo(data.content); // actualiza el editor
      setMostrandoHistorial(false);
    } else {
      console.error("No se pudo cargar el contenido del commit");
    }
  };

  if (!archivos.length) {
    return (
      <div className="text-center mt-10">
        <p className="mb-4 text-gray-700">No hay archivos disponibles</p>
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
          <option value="">Elegir</option>
          {archivos.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
        <button
          disabled={!archivoSeleccionado}
          onClick={async () => {
            await cargarHistorial();
            setMostrandoHistorial(true);
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition text-sm"
        >
          Historial
        </button>
      </div>
      {archivoSeleccionado && (<Editor file={archivoSeleccionado} contenido={contenidoArchivo} />)}
      {mostrandoHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Historial de versiones</h2>
            <div className="flex gap-2 items-center">
              <select
                value={commitSeleccionado}
                onChange={(e) => setCommitSeleccionado(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 mb-4"
              >
                <option value="">Elegir commit</option>
                {historialCommits.map(commit => (
                  <option key={commit.sha} value={commit.sha}>
                    {commit.message} ({commit.date})
                  </option>
                ))}
              </select>
              <button
                onClick={retomarDesdeCommit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Retomar
              </button>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setMostrandoHistorial(false)}
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
