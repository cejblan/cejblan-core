import { useState } from "react";

export default function ModalProductosDuplicados({ conflictos, onReemplazar, onCerrar }) {
  const [seleccionados, setSeleccionados] = useState(() =>
    conflictos.map((c) => ({ ...c.nuevo, reemplazar: true }))
  );

  const toggleProducto = (id) => {
    setSeleccionados((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, reemplazar: !p.reemplazar } : p
      )
    );
  };

  const setTodos = (valor) => {
    setSeleccionados((prev) =>
      prev.map((p) => ({ ...p, reemplazar: valor }))
    );
  };

  const enviar = () => {
    const aReemplazar = seleccionados.filter((p) => p.reemplazar);
    onReemplazar(aReemplazar); // se llama a la API que reemplaza
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center gap-1">
          ⚠ Productos ya registrados con diferencias
        </h2>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-yellow-100 text-yellow-800">
                <th className="p-1 text-center">ID</th>
                <th className="p-1 text-center">Nombre (actual / nuevo)</th>
                <th className="p-1 text-center">Cantidad</th>
                <th className="p-1 text-center">Precio</th>
                <th className="p-1 text-center">Precio Mayorista</th>
                <th className="p-1 text-center">¿Reemplazar?</th>
              </tr>
            </thead>
            <tbody>
              {conflictos.map((c, idx) => {
                const seleccionado = seleccionados.find((p) => p.id === c.nuevo.id);
                return (
                  <tr key={idx} className="border-t">
                    <td className="p-1">{String(c.nuevo.id).padStart(5, '0')}</td>
                    <td className="p-1">
                      <div>
                        <span className="text-gray-500 line-through">{c.original.name}</span>
                        <br />
                        <span className="text-green-600">{c.nuevo.name}</span>
                      </div>
                    </td>
                    <td className="p-1">{c.original.quantity} → <b>{c.nuevo.quantity}</b></td>
                    <td className="p-1">{c.original.price} → <b>{c.nuevo.price}</b></td>
                    <td className="p-1">{c.original.wholesale_price} → <b>{c.nuevo.wholesale_price}</b></td>
                    <td className="p-1 text-center">
                      <input
                        type="checkbox"
                        checked={seleccionado?.reemplazar || false}
                        onChange={() => toggleProducto(c.nuevo.id)}
                        className="w-2 h-2"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-1">
            <button
              onClick={() => setTodos(true)}
              className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 text-sm"
            >
              Reemplazar todos
            </button>
            <button
              onClick={() => setTodos(false)}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200 text-sm"
            >
              Descartar todos
            </button>
          </div>

          <div className="flex gap-1">
            <button
              onClick={onCerrar}
              className="bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
            >
              Cancelar
            </button>
            <button
              onClick={enviar}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Confirmar reemplazo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
