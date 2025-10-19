import { useState } from "react";

/*
  conflictos: [{ idx, name, pathname, existing: { url, pathname, uploadedAt }, nuevo: { size, type } }, ...]
  onConfirm(actions) -> actions = [{ idx, action: 'skip'|'replace'|'keep-both', rename? }, ...]
  onCerrar()
*/
export default function ModalImagenesDuplicadas({ conflictos = [], onConfirm, onCerrar }) {
  // Inicializamos seleccion con 'replace' por defecto (tu puedes cambiar)
  const [selecciones, setSelecciones] = useState(() =>
    conflictos.map(c => ({ idx: c.idx, option: 'ask', rename: '' }))
  );

  // opciones: 'keep-existing' (skip), 'replace', 'keep-both'
  const setOption = (idx, option) => {
    setSelecciones(prev => prev.map(s => s.idx === idx ? { ...s, option } : s));
  };

  const setRename = (idx, value) => {
    setSelecciones(prev => prev.map(s => s.idx === idx ? { ...s, rename: value } : s));
  };

  const setTodos = (option) => {
    setSelecciones(prev => prev.map(s => ({ ...s, option })));
  };

  const enviar = () => {
    const actions = selecciones.map(s => {
      let action;
      if (s.option === 'keep-existing') action = 'skip';
      else if (s.option === 'replace') action = 'replace';
      else if (s.option === 'keep-both') action = 'keep-both';
      else action = 'skip';
      return { idx: s.idx, action, rename: s.rename && s.rename.trim() ? s.rename.trim() : undefined };
    });
    onConfirm(actions);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center gap-1">
          ⚠ Conflictos de nombres
        </h2>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-yellow-100 text-yellow-800">
                <th className="p-1 text-left">Archivo</th>
                <th className="p-1 text-left">Existente</th>
                <th className="p-1 text-left">Nuevo</th>
                <th className="p-1 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {conflictos.map((c, idx) => {
                const sel = selecciones.find(s => s.idx === c.idx) || { option: 'keep-both', rename: '' };
                return (
                  <tr key={idx} className="border-t">
                    <td className="p-2">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.pathname}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-xs text-gray-600">
                        Subida:   {new Date(c.existing?.uploadedAt).toLocaleString("es-VE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }) || '—'}
                      </div>
                      <div className="text-sm text-blue-600 break-words">{c.existing?.pathname}</div>
                      {c.existing?.url && <a className="text-xs text-indigo-600" href={c.existing.url} target="_blank" rel="noreferrer">Ver existente</a>}
                    </td>
                    <td className="p-2">
                      <div className="text-sm">{(c.nuevo?.size ? `${Math.round(c.nuevo.size / 1024)} KB` : '')} {c.nuevo?.type || ''}</div>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm">
                          <input type="radio" checked={sel.option === 'keep-existing'} onChange={() => setOption(c.idx, 'keep-existing')} /> <span className="ml-2">Mantener existente</span>
                        </label>
                        <label className="text-sm">
                          <input type="radio" checked={sel.option === 'replace'} onChange={() => setOption(c.idx, 'replace')} /> <span className="ml-2">Reemplazar existente</span>
                        </label>
                        <label className="text-sm">
                          <input type="radio" checked={sel.option === 'keep-both'} onChange={() => setOption(c.idx, 'keep-both')} /> <span className="ml-2">Mantener ambas (renombrar nueva)</span>
                        </label>
                        {sel.option === 'keep-both' && (
                          <input
                            type="text"
                            placeholder="nuevo-nombre.png"
                            value={sel.rename}
                            onChange={(e) => setRename(c.idx, e.target.value)}
                            className="mt-1 border rounded px-2 py-1 text-sm"
                          />
                        )}
                      </div>
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
              onClick={() => setTodos('replace')}
              className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 text-sm"
            >
              Reemplazar todos
            </button>
            <button
              onClick={() => setTodos('keep-existing')}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200 text-sm"
            >
              Mantener existentes
            </button>
            <button
              onClick={() => setTodos('keep-both')}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 text-sm"
            >
              Mantener ambas (renombrar)
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
              Confirmar acciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
