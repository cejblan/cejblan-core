import { useState } from "react";

export default function CommitModal({ isOpen, onClose, onEnviar }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Guardar Cambios en GitHub</h2>

        <label className="block mb-2">
          Título del commit:
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            placeholder="Ej: Actualizar estilos del header"
          />
        </label>

        <label className="block mb-2">
          Descripción (opcional):
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            rows={4}
            placeholder="Detalles adicionales..."
          />
        </label>

        <p className="text-xs text-gray-600 mb-4">
          El título y la descripción del commit tendrán el prefijo <code>(CMS)</code> automáticamente.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            onClick={() => onEnviar({ titulo, descripcion })}
            className="px-4 py-2 bg-[#6ed8bf] text-white rounded hover:bg-[#4bb199]"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
