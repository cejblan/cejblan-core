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
        const res = await fetch(`/api/admin/cms/images?page=${pagina}&limit=${porPagina}`);
        const data = await res.json();
        console.log('Imágenes recibidas:', data.imagenes);
        setImagenes(data.imagenes || []);
        setTotalPaginas(data.totalPaginas || 1);
      } catch (err) {
        console.error('Error al cargar imágenes:', err);
      }
    };
    cargarImagenes();
  }, [pagina]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Galería Multimedia</h1>
      <div className="grid grid-cols-6 gap-4">
        {imagenes.map((img, i) => (
          <div key={i} className="bg-gray-100 w-full h-32 border rounded-xl overflow-hidden">
            <Image
              src={img.url}
              alt={`Imagen ${i}`}
              className="object-cover w-full h-full"
              width={100}
              height={100}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/icono-roto.png";
              }}
            />
          </div>
        ))}
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
        <span className="px-3 py-1">{pagina} / {totalPaginas}</span>
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
