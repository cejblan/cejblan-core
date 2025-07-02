// Parte superior: hooks y cropper
'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';

export default function Gallery() {
  const [imagenes, setImagenes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [cropBox, setCropBox] = useState({ top: 50, left: 50, width: 200, height: 200 });
  const cropRef = useRef(null);
  const isResizing = useRef(null);
  const [aspect, setAspect] = useState('libre');
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

  const iniciarResize = (lado) => {
    isResizing.current = lado;
  };

  const moverBorde = useCallback((e) => {
    if (!isResizing.current || !cropRef.current) return;
    const box = { ...cropBox };
    const deltaX = e.movementX;
    const deltaY = e.movementY;

    switch (isResizing.current) {
      case 'top':
        box.top += deltaY;
        box.height -= deltaY;
        break;
      case 'bottom':
        box.height += deltaY;
        break;
      case 'left':
        box.left += deltaX;
        box.width -= deltaX;
        break;
      case 'right':
        box.width += deltaX;
        break;
    }
    setCropBox(box);
  }, [cropBox]);

  useEffect(() => {
    const onMouseUp = () => (isResizing.current = null);
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const handleUpload = async (e) => {
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
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Galería Multimedia</h1>

      {/* Subir imagen */}
      <div className="mb-4">
        <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow transition-colors duration-200">
          Subir imagen
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Galería */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {imagenes.map((img, i) => (
          <div key={i} className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={img.url}
              alt={img.pathname}
              className="object-cover w-full h-full"
              width={200}
              height={200}
            />

            {/* Botón eliminar */}
            <button
              onClick={async () => {
                if (!confirm("¿Eliminar esta imagen?")) return;
                await fetch(`/api/cms/images?pathname=${encodeURIComponent(img.pathname)}`, {
                  method: "DELETE",
                });
                setPagina(1);
              }}
              className="absolute top-1 right-1 bg-red-600 text-white rounded px-1 py-0.5 text-xs hover:bg-red-700"
            >
              Eliminar
            </button>

            {/* Botón recortar */}
            <button
              onClick={() => setImagenSeleccionada(img)}
              className="absolute bottom-5 right-1 bg-green-600 text-white rounded px-1 py-0.5 text-xs hover:bg-green-500"
            >
              Recortar
            </button>

            {/* Botón copiar URL */}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(img.url);
                  alert("URL copiada al portapapeles");
                } catch (err) {
                  alert("Error al copiar URL");
                }
              }}
              className="absolute bottom-1 right-1 bg-blue-600 text-white rounded px-1 py-0.5 text-xs hover:bg-blue-500"
            >
              Copiar URL
            </button>
          </div>
        ))}
      </div>

      {/* Modal personalizado */}
      {imagenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
          <div
            className="relative bg-white rounded-xl p-4 max-w-3xl w-full m-4 max-h-[90vh] overflow-auto"
            onMouseMove={moverBorde}
            ref={cropRef}
          >
            <button
              onClick={() => setImagenSeleccionada(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >✕</button>

            <h2 className="text-lg font-bold mb-2">Recorte manual</h2>

            {/* Selector de aspecto */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setAspect('1:1')}
                className={`px-3 py-1 rounded ${aspect === '1:1' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}
              >1:1</button>
              <button
                onClick={() => setAspect('libre')}
                className={`px-3 py-1 rounded ${aspect === 'libre' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}
              >Libre</button>
            </div>

            <div className="relative w-full h-[60vh] bg-gray-100">
              <img
                src={imagenSeleccionada.url}
                alt="Recorte"
                className="absolute w-full h-full object-contain"
              />

              {aspect === 'libre' && (
                <div
                  className="absolute border-2 border-green-500 bg-white bg-opacity-20"
                  style={{
                    top: cropBox.top,
                    left: cropBox.left,
                    width: cropBox.width,
                    height: cropBox.height,
                  }}
                >
                  {/* Bordes de control */}
                  {['top', 'bottom', 'left', 'right'].map((lado) => (
                    <div
                      key={lado}
                      onMouseDown={() => iniciarResize(lado)}
                      className={`absolute bg-green-600 z-10 cursor-${lado === 'left' || lado === 'right' ? 'ew' : 'ns'}-resize`}
                      style={
                        lado === 'top'
                          ? { top: -4, left: 0, width: '100%', height: 8 }
                          : lado === 'bottom'
                          ? { bottom: -4, left: 0, width: '100%', height: 8 }
                          : lado === 'left'
                          ? { left: -4, top: 0, height: '100%', width: 8 }
                          : { right: -4, top: 0, height: '100%', width: 8 }
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => alert('Recorte manual capturado (aún no implementado el corte final).')}
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
              >
                Aplicar recorte
              </button>
              <button
                onClick={() => setImagenSeleccionada(null)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
