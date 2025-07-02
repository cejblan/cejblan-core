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
  const imgContainerRef = useRef(null);
  const isResizing = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [aspect, setAspect] = useState('libre');
  const porPagina = 36;

  useEffect(() => {
    if (imagenSeleccionada && imgContainerRef.current) {
      const img = imgContainerRef.current.querySelector('img');
      if (!img) return;
      const updateBox = () => {
        const rect = img.getBoundingClientRect();
        const containerRect = imgContainerRef.current.getBoundingClientRect();
        const left = rect.left - containerRect.left;
        const top = rect.top - containerRect.top;
        const width = rect.width;
        const height = rect.height;
        const size = Math.min(width, height);
        if (aspect === '1:1') {
          setCropBox({ top: top + (height - size) / 2, left: left + (width - size) / 2, width: size, height: size });
        } else {
          setCropBox({ top, left, width: Math.max(100, width * 0.6), height: Math.max(100, height * 0.6) });
        }
      };
      updateBox();
    }
  }, [imagenSeleccionada, aspect]);

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
    if (!imgContainerRef.current) return;
    const deltaX = e.movementX;
    const deltaY = e.movementY;
    const container = imgContainerRef.current.querySelector('img')?.getBoundingClientRect();
    if (!container) return;

    if (isResizing.current) {
      setCropBox(box => {
        const newBox = { ...box };
        if (isResizing.current === 'top') {
          const newTop = box.top + deltaY;
          const newHeight = box.height - deltaY;
          if (newTop >= 0 && newHeight >= 20) {
            newBox.top = newTop;
            newBox.height = newHeight;
          }
        } else if (isResizing.current === 'bottom') {
          const newHeight = box.height + deltaY;
          if (box.top + newHeight <= container.height) {
            newBox.height = newHeight;
          }
        } else if (isResizing.current === 'left') {
          const newLeft = box.left + deltaX;
          const newWidth = box.width - deltaX;
          if (newLeft >= 0 && newWidth >= 20) {
            newBox.left = newLeft;
            newBox.width = newWidth;
          }
        } else if (isResizing.current === 'right') {
          const newWidth = box.width + deltaX;
          if (box.left + newWidth <= container.width) {
            newBox.width = newWidth;
          }
        }
        return newBox;
      });
    } else if (isDragging.current) {
      setCropBox(box => {
        const newLeft = box.left + deltaX;
        const newTop = box.top + deltaY;
        return {
          ...box,
          left: Math.max(0, Math.min(newLeft, container.width - box.width)),
          top: Math.max(0, Math.min(newTop, container.height - box.height))
        };
      });
    }
  }, []);

  useEffect(() => {
    const onMouseUp = () => {
      isResizing.current = null;
      isDragging.current = false;
    };
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append("image", file);
    const res = await fetch("/api/cms/images", { method: "POST", body: formData });
    const data = await res.json(); if (data.secure_url) setPagina(1);
  };

  const aplicarRecorte = async () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imagenSeleccionada.url;

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropBox.width;
      canvas.height = cropBox.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        img,
        cropBox.left,
        cropBox.top,
        cropBox.width,
        cropBox.height,
        0,
        0,
        cropBox.width,
        cropBox.height
      );

      canvas.toBlob(async (blob) => {
        if (!blob) return alert('No se pudo generar el recorte');

        const formData = new FormData();
        formData.append('file', new File([blob], 'recorte.png', { type: 'image/png' }));

        const res = await fetch('/api/cms/images/crop', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          alert('Imagen recortada subida con éxito');
          setPagina(1); // para recargar galería
          setImagenSeleccionada(null);
        } else {
          alert('Error al subir imagen recortada');
        }
      }, 'image/png');
    };
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Galería Multimedia</h1>
      <div className="mb-4">
        <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow">
          Subir imagen
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {imagenes.map((img, i) => (
          <div key={i} className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-slate-100">
            <Image src={img.url} alt={img.pathname} className="object-cover w-full h-full" width={200} height={200} />
            <button onClick={async () => { if (!confirm("¿Eliminar esta imagen?")) return; await fetch(`/api/cms/images?pathname=${encodeURIComponent(img.pathname)}`, { method: "DELETE" }); setPagina(1); }} className="absolute top-1 right-1 z-10 bg-red-600 text-white rounded px-1 py-0.5 text-xs hover:bg-red-700">Eliminar</button>
            <button onClick={() => setImagenSeleccionada(img)} className="absolute bottom-5 right-1 z-10 bg-green-600 text-white rounded px-1 py-0.5 text-xs hover:bg-green-500">Recortar</button>
            <button onClick={async () => { try { await navigator.clipboard.writeText(img.url); alert("URL copiada"); } catch { alert("Error"); } }} className="absolute bottom-1 right-1 z-10 bg-blue-600 text-white rounded px-1 py-0.5 text-xs hover:bg-blue-500">Copiar URL</button>
          </div>
        ))}
      </div>
      {imagenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-xl p-2 max-w-3xl w-full m-4 max-h-[90vh] overflow-auto z-20" onMouseMove={moverBorde}>
            <button onClick={() => setImagenSeleccionada(null)} className="absolute top-2 right-2 z-30 text-slate-600 hover:text-black text-xl">✕</button>
            <h2 className="text-lg font-bold mb-2 z-30">Recorte manual</h2>
            <div className="relative flex justify-center items-center" style={{ height: '60vh !import' }}>
              <div ref={imgContainerRef} className="relative max-h-full w-auto">
                <img src={imagenSeleccionada.url} alt="Recorte" className="max-h-full object-contain" />
                {/* Fondo oscuro sobre la imagen */}
                <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-10">
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: cropBox.top, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                  <div style={{ position: 'absolute', top: cropBox.top + cropBox.height, left: 0, width: '100%', height: `calc(100% - ${cropBox.top + cropBox.height}px)`, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                  <div style={{ position: 'absolute', top: cropBox.top, left: 0, width: cropBox.left, height: cropBox.height, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                  <div style={{ position: 'absolute', top: cropBox.top, left: cropBox.left + cropBox.width, width: `calc(100% - ${cropBox.left + cropBox.width}px)`, height: cropBox.height, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                </div>
                {/* Área de recorte */}
                <div className="absolute border border-white z-20 cursor-move" style={{ ...cropBox }} onMouseDown={() => { isDragging.current = true; }} />
                {/* Bordes para redimensionar */}
                {aspect === 'libre' && ['top', 'bottom', 'left', 'right'].map(lado => (
                  <div key={lado} onMouseDown={() => iniciarResize(lado)} className={`absolute bg-black cursor-${lado === 'left' || lado === 'right' ? 'ew' : 'ns'}-resize z-30`} style={
                    lado === 'top' ? { top: cropBox.top - 4, left: cropBox.left, width: cropBox.width, height: 8 } :
                      lado === 'bottom' ? { top: cropBox.top + cropBox.height - 4, left: cropBox.left, width: cropBox.width, height: 8 } :
                        lado === 'left' ? { left: cropBox.left - 4, top: cropBox.top, width: 8, height: cropBox.height } :
                          { left: cropBox.left + cropBox.width - 4, top: cropBox.top, width: 8, height: cropBox.height }
                  } />
                ))}
              </div>
            </div>
            <div className="mt-2 flex z-30">
              <div className="flex gap-2">
                <button onClick={() => setAspect('1:1')} className={`px-3 py-1 rounded ${aspect === '1:1' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-black'}`}>1:1</button>
                <button onClick={() => setAspect('libre')} className={`px-3 py-1 rounded ${aspect === 'libre' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-black'}`}>Libre</button>
              </div>
              <div className="flex gap-2 justify-end w-full">
                <button onClick={aplicarRecorte} className="bg-slate-800 hover:bg-slate-900 text-white px-2 py-1 rounded">Aplicar recorte</button>
                <button onClick={() => setImagenSeleccionada(null)} className="bg-slate-300 hover:bg-slate-400 text-black px-2 py-1 rounded">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Paginación */}
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400" disabled={pagina === 1}>Anterior</button>
        <span className="px-2 py-1">{pagina}/{totalPaginas}</span>
        <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400" disabled={pagina === totalPaginas}>Siguiente</button>
      </div>
    </div>
  );
}
