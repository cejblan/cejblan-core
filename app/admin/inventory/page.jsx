'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { TbAlertTriangleFilled } from "react-icons/tb";

const sinonimos = {
  batidora: ["mezcladora", "amasadora"],
  licuadora: ["juguera", "sacajugos", "extractor de jugos"],
  camisa: ["camiseta", "franela", "playera"],
  pantalon: ["jean", "vaquero", "pantalón"],
  nevera: ["refrigerador", "frigorífico"],
  coche: ["auto", "automóvil", "vehículo", "carro"],
  libro: ["tomo", "volumen", "obra", "texto"],
  feliz: ["contento", "alegre", "dichoso", "gozoso"],
  triste: ["apenado", "melancólico", "decaído", "afligido"],
  grande: ["enorme", "gigante", "inmenso", "colosal"],
  pequeño: ["diminuto", "minúsculo", "chico", "breve"],
  rápido: ["veloz", "ágil", "ligero"],
  lento: ["pausado", "tardío", "torpe"],
  fuerte: ["robusto", "vigoroso", "resistente", "potente"],
  débil: ["frágil", "endeble", "flaco", "escaso"],
  oscuro: ["tenebroso", "sombrío", "lúgubre", "opaco"],
  claro: ["luminoso", "iluminado", "brillante"],
  nuevo: ["reciente", "moderno", "inédito"],
  viejo: ["antiguo", "ancestral", "vetusto"],
  limpio: ["aseado", "pulcro", "inmaculado"],
  sucio: ["ensuciado", "manchado", "contaminado"],
  rico: ["sabroso", "delicioso", "gustoso"],
  barato: ["económico", "asequible", "accesible"],
  caro: ["costoso", "onerosO", "lujoso"],
  suave: ["blando", "mansO", "terciopelo"],
  duro: ["firme", "rígido", "resistente"],
  caliente: ["tibio", "árido", "candente"],
  frío: ["gélido", "helado", "glacial"],
  seco: ["árido", "deshidratado", "reseco"],
  húmedo: ["mojado", "empapado", "encharcado"],
  pesado: ["denso", "masivo", "ponderoso"],
  ligero: ["liviano", "sutil", "etéreo"]
};

// Función que devuelve un conjunto de sinónimos para una palabra dada
function getSinonimosSet(word) {
  const base = word.toLowerCase();
  const set = new Set([base]);
  for (const [clave, vals] of Object.entries(sinonimos)) {
    if (clave === base || vals.includes(base)) {
      set.add(clave);
      vals.forEach(v => set.add(v.toLowerCase()));
    }
  }
  return set;
}

// Normaliza nombre a arreglo de palabras, sin espacios ni signos
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/g, '') // quita signos de puntuación
    .split(/\s+/)
    .filter(Boolean);
}

// Compara dos nombres considerando sinónimos y palabras en distinto orden
function sonNombresSimilares(nameA, nameB) {
  const wordsA = normalizeName(nameA);
  const wordsB = normalizeName(nameB);
  if (wordsA.length === 0 || wordsB.length === 0) return false;

  // Para cada palabra en A, comprobar si existe palabra en B que sea igual o sinónimo
  const allMatch = wordsA.every(wordA => {
    const setA = getSinonimosSet(wordA);
    return wordsB.some(wordB => getSinonimosSet(wordB).has(wordA) || setA.has(wordB));
  });

  if (!allMatch) return false;

  // También comprobar viceversa (para que ambos contengan sinónimos entre sí)
  const allMatchReverse = wordsB.every(wordB => {
    const setB = getSinonimosSet(wordB);
    return wordsA.some(wordA => getSinonimosSet(wordA).has(wordB) || setB.has(wordA));
  });

  return allMatchReverse;
}

export default function InventarioPage() {
  const [rows, setRows] = useState([]);
  const [dupIndices, setDupIndices] = useState([]);
  const [simIndices, setSimIndices] = useState([]);
  const [dupAlert, setDupAlert] = useState({ show: false, id: '' });
  const [simAlert, setSimAlert] = useState({ show: false, group: [] });
  const [pct, setPct] = useState('');
  const fileInputRef = useRef(null);
  const filePDFRef = useRef(null);

  const navbarRef = useRef(null);

  useEffect(() => {
    const empty = () => ({
      id: '',
      nombre: '',
      cantidad: '',
      precio: '',
      precioMayorista: '',
      valorInventario: '',
      calculated: false
    });

    setRows(Array.from({ length: 5 }, empty));
  }, []);

  const barRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [initialOffset, setInitialOffset] = useState(0);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!barRef.current) return;

      const currentY = window.scrollY;

      if (initialOffset === 0) {
        const rect = barRef.current.getBoundingClientRect();
        setInitialOffset(barRef.current.offsetTop);
        setWidth(rect.width);
        setHeight(rect.height);
      }

      if (currentY >= initialOffset) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialOffset]);

  const formatId = val => {
    const s = (val || '').toString().replace(/\D/g, '');
    return s ? s.padStart(4, '0') : '';
  };

  const onCellChange = (i, field, v) => {
    setRows(rs => {
      const copy = [...rs];
      const row = { ...copy[i], [field]: field === 'id' ? formatId(v) : v };

      if (field === 'cantidad' || field === 'precio') {
        const c = parseFloat(field === 'cantidad' ? v : row.cantidad);
        const p = parseFloat(field === 'precio' ? v : row.precio);
        const inv = (!isNaN(c) && !isNaN(p)) ? (c * p).toFixed(2) : '';
        row.valorInventario = inv;
        row.calculated = !!inv;
      }

      copy[i] = row;
      return copy;
    });
  };

  const runChecks = () => {
    // Detectar IDs duplicados
    const map = {};
    rows.forEach((r, i) => {
      if (r.id && r.id !== '0000') {
        map[r.id] = map[r.id] || [];
        map[r.id].push(i);
      }
    });
    const dups = Object.values(map).filter(arr => arr.length > 1).flat();
    setDupIndices(dups);

    // Detectar nombres similares considerando sinónimos
    const used = new Set();
    let simGroup = [];
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].nombre.trim() || used.has(i)) continue;
      const group = [i];
      for (let j = i + 1; j < rows.length; j++) {
        if (!rows[j].nombre.trim() || used.has(j)) continue;
        if (sonNombresSimilares(rows[i].nombre, rows[j].nombre)) {
          group.push(j);
        }
      }
      if (group.length > 1) {
        group.forEach(idx => used.add(idx));
        simGroup = group;
        break; // solo un grupo por ahora, igual que antes
      }
    }
    setSimIndices(simGroup);
  };

  const closeDup = () => setDupAlert(a => ({ ...a, show: false }));
  const closeSim = () => setSimAlert(s => ({ ...s, show: false }));

  const handleDupClick = id => setDupAlert({ show: true, id });
  const handleSimClick = () => setSimAlert({ show: true, group: simIndices });

  const onPDFChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return alert('Selecciona un PDF A2');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/inventory/parseA2', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || res.statusText);
      setRows(
        json.rows
          .filter(r => !r.nombre?.toLowerCase().includes('eliminar'))
          .map(r => ({
            ...r,
            precioMayorista: '',
            valorInventario: r.valorInventario || '',
            calculated: false
          }))
      );
      setTimeout(runChecks, 50);
    } catch (err) {
      console.error(err);
      alert('Error procesando PDF: ' + err.message);
    }
  };

  const loadExcel = () => fileInputRef.current.click();
  const onFileChange = async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const XLSX = await import('xlsx');
      const data = await f.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const arr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const hi = arr.findIndex(row =>
        row.some(c => c.toString().toLowerCase().includes('id')) &&
        row.some(c => c.toString().toLowerCase().includes('nombre'))
      );
      if (hi < 0) return alert('Encabezado no encontrado');
      const hdr = arr[hi].map(c => c.toString().toLowerCase());
      const idx = {
        id: hdr.indexOf('id'),
        nombre: hdr.indexOf('nombre'),
        cantidad: hdr.indexOf('cantidad'),
        precio: hdr.indexOf('precio'),
        precioMayorista: hdr.findIndex(h => h.includes('mayorista')),
        valorInventario: hdr.findIndex(h => h.includes('total') || h.includes('valorinventario'))
      };
      const dr = arr.slice(hi + 1).filter(r => r.some(c => c !== ''));
      const newRows = dr.map(r => {
        const cantidad = idx.cantidad > -1 ? r[idx.cantidad] : '';
        const precio = idx.precio > -1 ? r[idx.precio] : '';
        const valorRaw = idx.valorInventario > -1 ? r[idx.valorInventario] : '';
        let valorInventario = valorRaw;

        // Calcular si está vacío o no numérico
        if (!valorInventario || isNaN(Number(valorInventario))) {
          const c = parseFloat(cantidad);
          const p = parseFloat(precio);
          valorInventario = (!isNaN(c) && !isNaN(p)) ? (c * p).toFixed(2) : '';
        }

        return {
          id: idx.id > -1 ? formatId(r[idx.id]) : '',
          nombre: idx.nombre > -1 ? r[idx.nombre] : '',
          cantidad,
          precio,
          precioMayorista: idx.precioMayorista > -1 ? r[idx.precioMayorista] : '',
          valorInventario,
          calculated: false
        };
      });
      setRows(
        newRows.filter(r => !r.nombre?.toLowerCase().includes('eliminar'))
      );
      setRows(newRows);
      setTimeout(runChecks, 50);
    } catch (err) {
      console.error(err);
      alert('Error leyendo Excel');
    }
  };

  const handleSaveClick = () => {
    window.showSaveFilePicker({
      suggestedName: `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`,
      types: [{
        description: 'Excel',
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
      }]
    }).then(async handle => {
      try {
        const cleanRows = rows
          .filter(r => !r.nombre?.toLowerCase().includes('eliminar'))
          .map(r => ({
            id: r.id ?? '',
            nombre: r.nombre ?? '',
            cantidad: r.cantidad ?? '',
            precio: r.precio ?? '',
            precioMayorista: r.precioMayorista ?? '',
            valorInventario: r.valorInventario ?? ''
          }));

        const res = await fetch('/api/inventory/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: cleanRows })
        });

        if (!res.ok) throw new Error('Error al generar Excel');

        const blob = await res.blob();
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (e) {
        console.error(e);
        alert('No se pudo descargar Excel');
      }
    }).catch(e => {
      console.error('Guardado cancelado o bloqueado:', e);
    });
  };

  const calcWholesale = () => {
    const p = parseFloat(pct);
    if (isNaN(p) || p < 0) {
      setDupAlert({ show: true, id: 'Error de %' });
      return;
    }
    setRows(rs => rs.map(r => {
      const pr = parseFloat(r.precio);
      return {
        ...r,
        precioMayorista: isNaN(pr) ? '' : (pr * (p / 100)).toFixed(2)
      };
    }));
  };

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <main className="text-gray-800 min-h-screen relative">
        <div className="container mx-auto p-4">
          <header className="text-center mb-6">
            <h1 className="text-3xl font-bold">Inventario de Productos</h1>
            <p className="text-gray-600">Carga, edita y guarda. Avisos de IDs y nombres similares.</p>
          </header>

          {/* Placeholder para evitar salto */}
          {isFixed && <div style={{ height: height }}></div>}

          {/* Sticky navbar que se pega al llegar arriba */}
          <div
            ref={barRef}
            className={`z-50 shadow-md ${isFixed ? 'fixed top-5' : 'relative'
              } backdrop-blur-md bg-white/60 rounded-xl`}
            style={
              isFixed
                ? {
                  width: `${width}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }
                : {}
            }
          >
            <div className="text-sm flex flex-wrap gap-1 items-center justify-start p-1">
              <button
                onClick={() => setRows(rs => [
                  ...rs,
                  {
                    id: '',
                    nombre: '',
                    cantidad: '',
                    precio: '',
                    precioMayorista: '',
                    valorInventario: '',
                    calculated: false
                  }
                ])}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-1 rounded-lg shadow-md"
              >
                + Añadir Fila
              </button>
              <button onClick={() => filePDFRef.current.click()}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-1 rounded-lg shadow-md">
                Cargar Inventario A2
              </button>
              <input type="file" accept="application/pdf" ref={filePDFRef} className="hidden" onChange={onPDFChange} />

              <button onClick={loadExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-bold p-1 rounded-lg shadow-md">
                Cargar Excel
              </button>
              <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} className="hidden" onChange={onFileChange} />

              <button onClick={handleSaveClick}
                className="bg-teal-600  hover:bg-teal-700 text-white font-bold p-1 rounded-lg shadow-md">
                Guardar como Excel
              </button>
              <button
                onClick={runChecks}
                className="bg-purple-600  hover:bg-purple-700 text-white font-bold p-1 rounded-lg shadow-md"
              >
                Analizar
              </button>
              <div className="ml-auto flex items-center gap-1">
                <label htmlFor="wholesalePercent" className="text-sm font-medium text-gray-700">Precio Mayorista (%):</label>
                <input id="wholesalePercent" type="number" placeholder="Ej: 80"
                  className="w-24 p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={pct} onChange={e => setPct(e.target.value)} />
                <button onClick={calcWholesale}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1 rounded-lg shadow-md">
                  Calcular %
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {/* Tabla de productos */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-100">
                  <tr>
                    {['ID', 'Nombre', 'Cantidad', 'Precio', 'Precio Mayorista', 'Total'].map((h, i) =>
                      <th key={i} className="p-1 font-semibold text-center text-sm text-gray-600 uppercase tracking-wider border-b border-r border-gray-200 last:border-r-0">{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-1 border-r relative">
                        <input type="text" className="w-full bg-transparent focus:outline-none"
                          value={r.id} onChange={e => onCellChange(i, 'id', e.target.value)} />
                        {dupIndices.includes(i) && (
                          <div className="absolute bottom-1 right-1 text-red-500 cursor-pointer" onClick={() => handleDupClick(r.id)}>
                            <TbAlertTriangleFilled />
                          </div>
                        )}
                      </td>
                      <td className="p-1 relative">
                        <input type="text" className="w-full bg-transparent focus:outline-none"
                          value={r.nombre} onChange={e => onCellChange(i, 'nombre', e.target.value)} />
                        {simIndices.includes(i) && (
                          <div className="absolute bottom-1 right-1 text-amber-500 cursor-pointer" onClick={handleSimClick}>
                            <TbAlertTriangleFilled />
                          </div>
                        )}
                      </td>
                      {['cantidad', 'precio', 'precioMayorista'].map((f, j) =>
                        <td key={j} className="p-1 border-l">
                          <input type="number" className="w-full bg-transparent focus:outline-none"
                            value={r[f]} onChange={e => onCellChange(i, f, e.target.value)} />
                        </td>
                      )}
                      <td className="p-1 border-l text-center text-sm text-gray-700 relative">
                        {r.valorInventario ?? ''}
                        {r.valorInventario && r.calculated && (
                          <span className="absolute top-1 right-1 text-gray-400" title="Calculado">
                            <TbAlertTriangleFilled className="inline text-[12px]" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modales */}
            {dupAlert.show && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-4 max-w-md text-center">
                  <h3 className="text-xl font-bold mb-2">ID Duplicado</h3>
                  <p className="text-gray-600">El ID “{dupAlert.id}” está repetido en filas {dupIndices.map(i => i + 1).join(', ')}.</p>
                  <button onClick={closeDup} className="mt-4 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">Entendido</button>
                </div>
              </div>
            )}
            {simAlert.show && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-4 max-w-lg">
                  <h3 className="text-xl font-bold mb-2">Nombres Similares</h3>
                  <ul className="list-disc pl-5 text-gray-600">
                    {simAlert.group.map(i =>
                      <li key={i}>Fila {i + 1}: "{rows[i].nombre}"</li>
                    )}
                  </ul>
                  <button onClick={closeSim} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white py-1 px-3 rounded-lg">Entendido</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
