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
  const [mostrarConfirmacionMerge, setMostrarConfirmacionMerge] = useState(false);
  const [errorMerge, setErrorMerge] = useState('');
  const [mostrandoErrorMerge, setMostrandoErrorMerge] = useState(false);

  // Cargar lista de archivos desde GitHub (solo una vez al montar)
  useEffect(() => {
    fetch('/api/github/list')
      .then(res => res.json())
      .then(data => {
        if (data.files?.length) {
          setArchivos(data.files);
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-2 w-full">
        <div className="flex-grow">
          <select
            value={archivoSeleccionado}
            onChange={(e) => setArchivoSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Elegir...</option>
            {archivos.map((file) => (
              <option key={file} value={file}>
                {file.split('/').pop().replace(/\.[^/.]+$/, '')}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={!archivoSeleccionado}
          onClick={async () => {
            await cargarHistorial();
            setMostrandoHistorial(true);
          }}
          className={`w-full sm:w-auto px-3 py-2 rounded ${archivoSeleccionado
            ? "bg-slate-600 text-white hover:bg-slate-700 font-bold cursor-pointer"
            : "bg-slate-600 text-slate-700 font-bold cursor-not-allowed"
            }`}
        >
          Historial
        </button>

        <button
          disabled={!archivoSeleccionado}
          className={`w-full sm:w-auto px-3 py-2 rounded ${archivoSeleccionado
            ? "bg-red-600 text-white hover:bg-red-700 font-bold cursor-pointer"
            : "bg-red-600 text-red-700 font-bold cursor-not-allowed"
            }`}
          onClick={() => setMostrarConfirmacionMerge(true)}
        >
          Publicar en producción
        </button>

        {archivoSeleccionado.includes('components/pages/') && (
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL}/${archivoSeleccionado
              .replace('components/pages/', '')
              .replace(/\.[^/.]+$/, '')
              .toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-green-600 text-white font-bold px-3 py-2 rounded hover:bg-green-700 text-center"
          >
            Ver publicada
          </a>
        )}

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
                className="w-full border border-gray-300 rounded p-2"
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
      {mostrarConfirmacionMerge && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-red-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              ⚠️ ¡Advertencia crítica!
            </h2>
            <p className="text-gray-800 mb-4">
              Esta acción enviará los cambios de <strong className="text-blue-600">develop</strong> a <strong className="text-black">main</strong> y no se puede deshacer.
            </p>
            <p className="text-lg font-semibold text-red-600 mb-6">
              ¿Estás absolutamente seguro de que deseas continuar?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setMostrarConfirmacionMerge(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
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
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrandoErrorMerge && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-red-800 p-6 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-red-800 mb-4">🛑 Error Grave</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line mb-6">{errorMerge}</p>
            <div className="text-right">
              <button
                className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                onClick={() => setMostrandoErrorMerge(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
