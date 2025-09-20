"use client";

import { useEffect, useState } from "react";
import { FcOpenedFolder } from "react-icons/fc";
import Image from "next/image";

export default function GaleriaModal({
  abierto,
  onClose,
  onSelect,
  porPagina = 36,
}) {
  const [itemsRaw, setItemsRaw] = useState([]); // items crudos traídos del backend
  const [paginaGaleria, setPaginaGaleria] = useState(1);
  const [totalPaginasGaleria, setTotalPaginasGaleria] = useState(1);
  const [currentFolderGaleria, setCurrentFolderGaleria] = useState(''); // '' = raíz

  const cargarImagenes = async () => {
    try {
      const res = await fetch(`/api/cms/images?page=${paginaGaleria}&limit=${porPagina}`);
      const data = await res.json();
      const items = data.items || [];
      setItemsRaw(items);
      setTotalPaginasGaleria(data.totalPaginas || 1);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
    }
  };

  useEffect(() => {
    if (abierto) {
      cargarImagenes();
      setCurrentFolderGaleria(''); // reset al abrir
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, paginaGaleria]);

  if (!abierto) return null;

  // Derivar carpetas directas y archivos dentro de currentFolderGaleria
  const computeView = () => {
    const folderSet = new Set();
    const files = [];

    const prefix = currentFolderGaleria ? `${currentFolderGaleria}/` : '';

    for (const item of itemsRaw) {
      const path = item.pathname || item.name || '';
      if (!path) continue;

      // si el item explícitamente dice ser carpeta, la tratamos como carpeta
      if (item.type === 'folder') {
        // carpeta absoluta (puede incluir subcarpetas en el pathname)
        const parts = path.split('/');
        const top = parts[0];
        if (!currentFolderGaleria) {
          // en raíz: añadir la carpeta top-level (p. ej. "carpeta")
          folderSet.add(top);
        } else {
          // si estamos dentro de una carpeta, verificar si pertenece a ella
          if (path.startsWith(prefix)) {
            const rest = path.slice(prefix.length);
            if (!rest) continue;
            const partsRest = rest.split('/');
            if (partsRest.length > 1) folderSet.add(partsRest[0]);
            // si rest no tiene /, entonces la carpeta actual contiene esta carpeta hija
          }
        }
        continue; // ya procesada
      }

      // Si estamos en raíz
      if (!currentFolderGaleria) {
        const parts = path.split('/');
        if (parts.length > 1) {
          // primer segmento es carpeta
          folderSet.add(parts[0]);
        } else {
          // archivo en raíz
          // evitar considerar como archivo si explícitamente viene como carpeta
          files.push(item);
        }
      } else {
        // estamos en una carpeta específica
        if (!path.startsWith(prefix)) continue;
        const rest = path.slice(prefix.length); // lo que queda después de la carpeta actual/
        if (!rest) continue;
        const parts = rest.split('/');
        if (parts.length > 1) {
          // hay al menos una subcarpeta inmediata
          folderSet.add(parts[0]);
        } else {
          // archivo directo en la carpeta actual
          files.push(item);
        }
      }
    }

    // convertir set a array ordenado
    const folders = Array.from(folderSet).sort((a,b)=>a.localeCompare(b));
    return { folders, files };
  };

  const { folders, files } = computeView();

  const enterFolder = (folderName) => {
    const newPath = currentFolderGaleria ? `${currentFolderGaleria}/${folderName}` : folderName;
    setCurrentFolderGaleria(newPath);
  };

  const goUp = () => {
    if (!currentFolderGaleria) return;
    const parts = currentFolderGaleria.split('/');
    parts.pop();
    const parent = parts.join('/');
    setCurrentFolderGaleria(parent);
  };

  const labelCurrent = currentFolderGaleria ? currentFolderGaleria : '/';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-xl p-4 max-w-4xl w-full m-4 max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-600 hover:text-black text-xl"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold">Seleccionar imagen</h2>
          <div className="ml-auto flex items-center gap-2">
            {currentFolderGaleria && (
              <button
                onClick={goUp}
                className="bg-white px-3 py-1 rounded hover:bg-gray-200 text-sm"
              >
                ↩ Volver
              </button>
            )}
            <div className="text-sm text-gray-600 font-mono">Ruta: {labelCurrent}</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mostrar carpetas primero (si las hay) */}
          {folders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                <FcOpenedFolder className="text-xl" />
                <span>Carpetas</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-2">
                {folders.map((f, idx) => {
                  const pathname = currentFolderGaleria ? `${currentFolderGaleria}/${f}` : f;
                  return (
                    <div
                      key={idx}
                      tabIndex={0}
                      title={pathname}
                      onDoubleClick={() => enterFolder(f)}            // abrir solo con doble click
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} // click simple no selecciona
                      onKeyDown={(e) => { /* mantenemos doble click para abrir */ }}
                      className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer select-none focus:ring-2 focus:ring-sky-400"
                    >
                      {/* Icono centrado; no es un <Image /> */}
                      <div className="flex flex-col items-center gap-2 justify-center p-4 pointer-events-none">
                        <FcOpenedFolder className="text-5xl" />
                        <span className="text-sm break-all text-center">{f}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Archivos en la carpeta actual */}
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold mb-2">
              <span>{currentFolderGaleria ? "Imágenes" : "Imágenes en raíz"}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((img, i) => (
                <div
                  key={i}
                  tabIndex={0}
                  title={img.pathname}
                  className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer select-none focus:ring-2 focus:ring-sky-400"
                  onClick={() => {
                    // si img.url no existe, no seleccionamos
                    if (!img.url) return;
                    onSelect(img.url);
                    onClose();
                  }}
                >
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={img.pathname || "imagen"}
                      className="object-scale-down w-full h-full"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      Sin vista previa
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPaginaGaleria((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400"
            disabled={paginaGaleria === 1}
          >
            Anterior
          </button>
          <span className="px-2 py-1">{paginaGaleria}/{totalPaginasGaleria}</span>
          <button
            onClick={() => setPaginaGaleria((p) => Math.min(totalPaginasGaleria, p + 1))}
            className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400"
            disabled={paginaGaleria === totalPaginasGaleria}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
