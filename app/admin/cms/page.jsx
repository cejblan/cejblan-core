"use client"

import { useEffect, useState } from 'react';
import Editor from './Lienzo'; // Tu componente MonacoEditor

export default function CMS() {
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState('');

  useEffect(() => {
    fetch('/api/cms/list')
      .then(res => res.json())
      .then(data => {
        setArchivos(data.files);
        setArchivoSeleccionado(data.files[0]); // Selecciona el primero por defecto
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
