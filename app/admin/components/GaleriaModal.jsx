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
  const [imagenes, setImagenes] = useState({});
  const [paginaGaleria, setPaginaGaleria] = useState(1);
  const [totalPaginasGaleria, setTotalPaginasGaleria] = useState(1);

  const cargarImagenes = async () => {
    try {
      const res = await fetch(`/api/cms/images?page=${paginaGaleria}&limit=${porPagina}`);
      const data = await res.json();
      const agrupadas = {};

      // ✅ usar data.items en lugar de data.imagenes
      (data.items || []).forEach((img) => {
        const partes = img.pathname.split("/");
        const folder = partes.length > 1 ? partes.slice(0, -1).join("/") : "/";
        if (!agrupadas[folder]) agrupadas[folder] = [];
        agrupadas[folder].push(img);
      });

      setImagenes(agrupadas);
      setTotalPaginasGaleria(data.totalPaginas || 1);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
    }
  };

  useEffect(() => {
    if (abierto) cargarImagenes();
  }, [abierto, paginaGaleria]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-xl p-4 max-w-4xl w-full m-4 max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-600 hover:text-black text-xl"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">Seleccionar imagen</h2>

        <div className="space-y-6">
          {Object.entries(imagenes).map(([folder, imgs]) => (
            <div key={folder}>
              <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                <FcOpenedFolder className="text-xl" />
                <span>{folder === "/" ? "Raíz" : folder}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {imgs.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => {
                      onSelect(img.url);
                      onClose();
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.pathname}
                      className="object-scale-down w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
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
