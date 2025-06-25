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
        if (Array.isArray(data.files) && data.files.length > 0) {
          setArchivos(data.files);
          setArchivoSeleccionado(data.files[0]); // primero por defecto
        }
      })
      .catch(err => {
        console.error('Error al cargar archivos:', err);
      });
  }, []);

  return (
    <div>
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
    </div>
  );
}
