"use client";

import { useEffect, useState } from 'react';
import Editor from './Lienzo';

export default function CMS() {
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState('');

  useEffect(() => {
    fetch('/api/cms/list')
      .then(res => res.json())
      .then(data => {
        if (data.files?.length) {
          setArchivos(data.files);
          setArchivoSeleccionado(data.files[0]);
        }
      });
  }, []);

  const nuevoArchivo = async () => {
    const nombre = prompt('Nombre del nuevo archivo (ej: nuevo.html):');
    if (!nombre || !nombre.trim()) return;

    try {
      await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: nombre.trim(), content: '' })
      });

      setArchivos(prev => [nombre.trim(), ...prev]);
      setArchivoSeleccionado(nombre.trim());
      window.history.replaceState(null, '', `?file=${nombre.trim()}`);
    } catch (err) {
      console.error('Error al crear archivo:', err);
    }
  };

  if (!archivos.length) {
    return (
      <div className="text-center mt-10">
        <p className="mb-4 text-gray-700">No hay archivos disponibles.</p>
        <button
          onClick={nuevoArchivo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Crear nuevo archivo
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
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
      </div>

      {archivoSeleccionado && <Editor file={archivoSeleccionado} />}
    </div>
  );
}
