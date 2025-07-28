// app/inventario/page.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function InventarioPage() {
  // Filas de inventario
  const [rows, setRows] = useState([]);
  // Modales de alerta
  const [dupAlert, setDupAlert] = useState({ show: false, title: '', message: '' });
  const [simAlert, setSimAlert] = useState({ show: false, group: [] });
  // Porcentaje mayorista
  const [pct, setPct] = useState('');
  // Ref para carga de archivo
  const fileInputRef = useRef(null);

  // Inicializar 5 filas vacías al montar
  useEffect(() => {
    const empty = () => ({ id: '', nombre: '', cantidad: '', precio: '', precioMayorista: '' });
    setRows(Array.from({ length: 5 }, empty));
  }, []);

  // Formatear ID a 4 dígitos
  const formatId = (val) => {
    const s = (val || '').toString().replace(/\D/g, '');
    return s ? s.padStart(4, '0') : '';
  };

  // Detectar cambios en celdas
  const onCellChange = (i, field, value) => {
    setRows((rs) => {
      const copy = [...rs];
      copy[i] = {
        ...copy[i],
        [field]: field === 'id' ? formatId(value) : value,
      };
      return copy;
    });
  };

  // Añadir fila vacía
  const addRow = () => {
    setRows((rs) => [...rs, { id: '', nombre: '', cantidad: '', precio: '', precioMayorista: '' }]);
  };

  // Calcular precios mayoristas
  const calcWholesale = () => {
    const p = parseFloat(pct);
    if (isNaN(p) || p < 0) {
      setDupAlert({ show: true, title: 'Error de Cálculo', message: 'Por favor, introduce un porcentaje válido.' });
      return;
    }
    setRows((rs) =>
      rs.map((r) => {
        const pr = parseFloat(r.precio);
        return {
          ...r,
          precioMayorista: isNaN(pr) ? '' : (pr * (p / 100)).toFixed(2),
        };
      })
    );
  };

  // Detección de duplicados y similitudes
  const runChecks = () => {
    // IDs duplicados
    const map = {};
    rows.forEach((r, i) => {
      if (r.id && r.id !== '0000') {
        map[r.id] = map[r.id] || [];
        map[r.id].push(i);
      }
    });
    for (const id in map) {
      if (map[id].length > 1) {
        setDupAlert({ show: true, title: 'ID Duplicado', message: `El ID "${id}" está repetido.` });
        return;
      }
    }
    // Nombres similares
    const normalized = rows.map((r, i) => ({
      norm: r.nombre.trim().toLowerCase().replace(/[\s_-]/g, ''),
      idx: i,
    }));
    const groups = [];
    const used = new Set();
    normalized.forEach((n, i) => {
      if (!n.norm || used.has(i)) return;
      const g = [i];
      normalized.slice(i + 1).forEach((m, j) => {
        if (!m.norm || used.has(i + 1 + j)) return;
        // Distancia Levenshtein simple
        const dist = (() => {
          const a = n.norm, b = m.norm;
          const costs = [];
          for (let x = 0; x <= a.length; x++) {
            let last = x;
            for (let y = 0; y <= b.length; y++) {
              if (x === 0) costs[y] = y;
              else if (y > 0) {
                let nw = costs[y - 1];
                if (a[x - 1] !== b[y - 1]) nw = Math.min(nw, last, costs[y]) + 1;
                costs[y - 1] = last;
                last = nw;
              }
            }
            if (x > 0) costs[b.length] = last;
          }
          return costs[b.length];
        })();
        if (dist <= Math.min(n.norm.length, m.norm.length) / 2) {
          g.push(i + 1 + j);
        }
      });
      if (g.length > 1) {
        g.forEach((idx) => used.add(idx));
        groups.push(g);
      }
    });
    if (groups.length) setSimAlert({ show: true, group: groups[0] });
  };
  useEffect(runChecks, [rows]);

  // Cerrar modales
  const closeDup = () => setDupAlert((a) => ({ ...a, show: false }));
  const closeSim = () => setSimAlert((s) => ({ ...s, show: false }));

  // Cargar Excel desde archivo (import dinámico)
  const loadExcel = () => fileInputRef.current.click();
  const onFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const XLSX = await import('xlsx'); // SIN .default

      const data = await f.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const arr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      console.log('XLSX RAW:', arr);

      const hi = arr.findIndex(
        (row) =>
          row.some((c) => c.toString().toLowerCase().includes('id')) &&
          row.some((c) => c.toString().toLowerCase().includes('nombre'))
      );
      if (hi < 0) {
        alert('No encontré la fila de encabezado (busqué "ID" y "Nombre").');
        return;
      }

      const hdr = arr[hi].map((c) => c.toString().toLowerCase());
      const idx = {
        id: hdr.indexOf('id'),
        nombre: hdr.indexOf('nombre'),
        cantidad: hdr.indexOf('cantidad'),
        precio: hdr.indexOf('precio'),
        precioMayorista: hdr.findIndex((h) => h.includes('mayorista')),
      };

      const dr = arr.slice(hi + 1).filter((r) => r.some((c) => c !== ''));
      const newRows = dr.map((r) => ({
        id: idx.id > -1 ? formatId(r[idx.id]) : '',
        nombre: idx.nombre > -1 ? r[idx.nombre] : '',
        cantidad: idx.cantidad > -1 ? r[idx.cantidad] : '',
        precio: idx.precio > -1 ? r[idx.precio] : '',
        precioMayorista: idx.precioMayorista > -1 ? r[idx.precioMayorista] : '',
      }));
      console.log('PARSED ROWS:', newRows);

      setRows(newRows);
      runChecks();
    } catch (err) {
      console.error('Error leyendo Excel:', err);
      alert('Falló la carga del Excel. Mira la consola para más detalles.');
    }
  };

  // Guardar Excel vía API (ExcelJS en servidor)
  const saveExcel = async () => {
    try {
      const res = await fetch('/api/inventory/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error('Error al generar Excel');
      const blob = await res.blob();
      if (!window.showSaveFilePicker) {
        alert('Tu navegador no soporta guardar con selector de ubicación.');
        return;
      }
      const handle = await window.showSaveFilePicker({
        suggestedName: `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`,
        types: [
          {
            description: 'Archivo Excel',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (e) {
      console.error(e);
      alert('No se pudo descargar el Excel.');
    }
  };

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <main className="text-gray-800 min-h-screen">
        <div className="container mx-auto p-2 sm:p-3 lg:p-4">
          <header className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Inventario de Productos
            </h1>
            <p className="mt-2 text-md text-gray-600">
              Carga, edita y guarda tu inventario. El sistema te avisará si un ID o nombre está repetido.
            </p>
          </header>

          {/* Barra de acciones */}
          <div className="sticky-nav bg-gray-50/80 backdrop-blur-sm p-2 rounded-lg shadow-md mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={addRow}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg shadow-md transition-transform transform hover:scale-105">
                + Añadir Fila
              </button>
              <button onClick={loadExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Cargar Excel
              </button>
              <button onClick={saveExcel}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-2 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Guardar como Excel
              </button>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                ref={fileInputRef}
                className="hidden"
                onChange={onFileChange}
              />

              <div className="ml-auto flex items-center gap-2">
                <label htmlFor="wholesalePercent" className="text-sm font-medium text-gray-700">
                  Precio Mayorista (%):
                </label>
                <input
                  type="number"
                  id="wholesalePercent"
                  placeholder="Ej: 80"
                  className="w-24 p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={pct}
                  onChange={(e) => setPct(e.target.value)}
                />
                <button onClick={calcWholesale}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded-lg shadow-md">
                  Calcular %
                </button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  {['ID', 'Nombre', 'Cantidad', 'Precio', 'Precio Mayorista'].map((h, i) => (
                    <th key={i}
                      className="p-1 font-semibold text-left text-sm text-gray-600 uppercase tracking-wider border-b border-r last:border-r-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-1 border-r border-gray-200">
                      <input type="text" className="w-full bg-transparent focus:outline-none"
                        value={r.id} onChange={(e) => onCellChange(i, 'id', e.target.value)} />
                    </td>
                    <td className="p-1 border-r border-gray-200 relative">
                      <input type="text" className="w-full bg-transparent focus:outline-none"
                        value={r.nombre} onChange={(e) => onCellChange(i, 'nombre', e.target.value)} />
                      {simAlert.show && simAlert.group.includes(i) && (
                        <div className="absolute bottom-1 right-1 text-amber-500 cursor-pointer"
                          onClick={closeSim}>⚠</div>
                      )}
                    </td>
                    {['cantidad', 'precio', 'precioMayorista'].map((f, idx2) => (
                      <td key={idx2} className="p-1 border-r border-gray-200">
                        <input type="number" className="w-full bg-transparent focus:outline-none"
                          value={r[f]} onChange={(e) => onCellChange(i, f, e.target.value)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modales */}
          {dupAlert.show && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-1 max-w-md text-center">
                <h3 className="text-xl font-bold mb-2">{dupAlert.title}</h3>
                <p className="text-gray-600">{dupAlert.message}</p>
                <button onClick={closeDup}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-lg">
                  Entendido
                </button>
              </div>
            </div>
          )}
          {simAlert.show && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-3 max-w-lg">
                <h3 className="text-xl font-bold mb-2">Nombres Similares</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  {simAlert.group.map((i) => (
                    <li key={i}>Fila {i + 1}: "{rows[i].nombre}"</li>
                  ))}
                </ul>
                <button onClick={closeSim}
                  className="mt-2 bg-amber-600 hover:bg-amber-700 text-white py-1 px-2 rounded-lg">
                  Entendido
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
