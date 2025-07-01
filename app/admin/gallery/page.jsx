'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Gallery() {
  const [imagenes, setImagenes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const porPagina = 36;

  useEffect(() => {
    const cargarImagenes = async () => {
      try {
        const res = await fetch(`/api/cms/images?page=${pagina}&limit=${porPagina}`);
        const data = await res.json();
        setImagenes(data.imagenes || []);
        setTotalPaginas(data.totalPaginas || 1);
      } catch (err) {
        console.error('Error al cargar imágenes:', err);
      }
    };
    cargarImagenes();
  }, [pagina]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Galería Multimedia</h1>

      {/* Botón de carga al estilo Telegram */}
      <div className="mb-4">
        <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow transition-colors duration-200">
          Subir imagen
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("image", file);

              const res = await fetch("/api/cms/images", {
                method: "POST",
                body: formData,
              });

              const data = await res.json();
              if (data.secure_url) {
                setPagina(1);
              }
            }}
            className="hidden"
          />
        </label>
      </div>

      {/* Galería */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {imagenes.map((img, i) => {
          const esImagen = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(img.pathname);
          return (
            <div key={i} className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-gray-100">
              {esImagen ? (
                <Image
                  src={img.url}
                  alt={img.pathname}
                  className="object-cover w-full h-full"
                  width={200}
                  height={200}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/icono-roto.png";
                  }}
                />
              ) : (
                <span className="text-xs text-gray-600">{img.pathname}</span>
              )}
              {/* Eliminar */}
              <button
                onClick={async () => {
                  if (!confirm("¿Eliminar esta imagen?")) return;
                  await fetch(`/api/cms/images?pathname=${encodeURIComponent(img.pathname)}`, {
                    method: "DELETE",
                  });
                  setPagina(1);
                }}
                className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 py-0.5 text-xs hover:bg-red-700"
              >
                Eliminar
              </button>
              {/* Copiar */}
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(img.url);
                    alert("URL copiada al portapapeles");
                  } catch (err) {
                    alert("Error al copiar URL");
                  }
                }}
                className="absolute bottom-1 right-1 bg-blue-600 text-white rounded px-2 py-0.5 text-xs hover:bg-blue-500"
              >
                Copiar URL
              </button>
            </div>
          );
        })}
      </div>
      {/* Paginación */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={pagina === 1}
        >
          Anterior
        </button>
        <span className="px-2 py-1">{pagina}/{totalPaginas}</span>
        <button
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={pagina === totalPaginas}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}