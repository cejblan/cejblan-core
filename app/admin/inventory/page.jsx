'use client';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function InventarioPage() {
  const [rows, setRows] = useState([]);
  const [dupAlert, setDupAlert] = useState({ show: false, title: '', message: '' });
  const [simAlert, setSimAlert] = useState({ show: false, group: [] });
  const [pct, setPct] = useState('');
  const fileInputRef = useRef(null);
  const filePDFRef   = useRef(null);

  // Inicializamos 5 filas vacías
  useEffect(() => {
    const empty = () => ({ id: '', nombre: '', cantidad: '', precio: '', precioMayorista: '' });
    setRows(Array.from({ length: 5 }, empty));
  }, []);

  const formatId = val => {
    const s = (val||'').toString().replace(/\D/g,'');
    return s ? s.padStart(4,'0') : '';
  };

  const onCellChange = (i, field, v) => {
    setRows(rs => {
      const copy = [...rs];
      copy[i] = {
        ...copy[i],
        [field]: field==='id' ? formatId(v) : v
      };
      return copy;
    });
  };

  const addRow = () => {
    setRows(rs => [...rs, { id:'', nombre:'', cantidad:'', precio:'', precioMayorista:'' }]);
  };

  // Duplicados / similitudes (idéntica lógica tuya)
  const runChecks = (showSimModal = true) => {
    // duplicados ID
    const map = {};
    rows.forEach((r,i)=> {
      if (r.id && r.id!=='0000') map[r.id] = map[r.id]||[], map[r.id].push(i);
    });
    for (const id in map) {
      if (map[id].length>1) {
        setDupAlert({ show:true, title:'ID Duplicado', message:`El ID "${id}" está repetido.` });
        return;
      }
    }
    // nombres similares (Levenshtein)
    const normalized = rows.map((r,i)=>({
      norm: r.nombre.trim().toLowerCase().replace(/[\s_-]/g,''), idx:i
    }));
    const groups = [], used = new Set();
    normalized.forEach((n,i)=> {
      if (!n.norm||used.has(i)) return;
      const g=[i];
      normalized.slice(i+1).forEach((m,j)=> {
        if (!m.norm||used.has(i+1+j)) return;
        // distancia básica
        const a=n.norm, b=m.norm;
        const costs=[];
        for(let x=0;x<=a.length;x++){
          let last=x;
          for(let y=0;y<=b.length;y++){
            if(x===0) costs[y]=y;
            else if(y>0){
              let nw=costs[y-1];
              if(a[x-1]!==b[y-1]) nw=Math.min(nw,last,costs[y])+1;
              costs[y-1]=last;
              last=nw;
            }
          }
          if(x>0) costs[b.length]=last;
        }
        const dist = costs[b.length];
        if(dist <= Math.min(a.length,b.length)/2) g.push(i+1+j);
      });
      if(g.length>1){
        g.forEach(idx=>used.add(idx));
        groups.push(g);
      }
    });
    if(groups.length){
      setSimAlert(prev=>({...prev, group:groups[0], show:showSimModal}));
    }
  };

  useEffect(()=>{ runChecks(false); }, [rows]);

  const closeDup = () => setDupAlert(a=>({...a, show:false}));
  const closeSim = () => setSimAlert(s=>({...s, show:false}));

  // ---------- NUEVA LÓGICA PDF POR API -----------

  const onPDFChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return alert('Selecciona un PDF A2');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/inventory/parseA2', { method:'POST', body:fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error||res.statusText);

      // el server nos devuelve rows: [{id,nombre,cantidad,precio},...]
      setRows(json.rows.map(r=>({
        ...r,
        precioMayorista:''
      })));
      runChecks();
    } catch(err) {
      console.error(err);
      alert('Error procesando PDF: '+err.message);
    }
  };

  // ---------- LÓGICA EXCEL (igual que antes) ----------

  const loadExcel = () => fileInputRef.current.click();
  const onFileChange = async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const XLSX = await import('xlsx');
      const data = await f.arrayBuffer();
      const wb = XLSX.read(data,{type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const arr = XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      const hi = arr.findIndex(row=>
        row.some(c=>c.toString().toLowerCase().includes('id')) &&
        row.some(c=>c.toString().toLowerCase().includes('nombre'))
      );
      if(hi<0) return alert('Encabezado no encontrado');
      const hdr = arr[hi].map(c=>c.toString().toLowerCase());
      const idx = {
        id: hdr.indexOf('id'),
        nombre: hdr.indexOf('nombre'),
        cantidad: hdr.indexOf('cantidad'),
        precio: hdr.indexOf('precio'),
        precioMayorista: hdr.findIndex(h=>h.includes('mayorista'))
      };
      const dr = arr.slice(hi+1).filter(r=>r.some(c=>c!==''));
      const newRows = dr.map(r=>({
        id: idx.id>-1? formatId(r[idx.id]): '',
        nombre: idx.nombre>-1? r[idx.nombre]:'',
        cantidad: idx.cantidad>-1? r[idx.cantidad]:'',
        precio: idx.precio>-1? r[idx.precio]:'',
        precioMayorista: idx.precioMayorista>-1? r[idx.precioMayorista]:''
      }));
      setRows(newRows);
      runChecks();
    } catch(err) {
      console.error(err);
      alert('Error leyendo Excel');
    }
  };

  const saveExcel = async () => {
    try {
      const res = await fetch('/api/inventory/export',{ 
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ rows })
      });
      if(!res.ok) throw new Error('Error al generar Excel');
      const blob = await res.blob();
      const handle = await window.showSaveFilePicker({
        suggestedName:`inventario_${new Date().toISOString().slice(0,10)}.xlsx`,
        types:[{ description:'Excel', accept:{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx'] }}]
      });
      const w = await handle.createWritable();
      await w.write(blob);
      await w.close();
    } catch(e) {
      console.error(e);
      alert('No se pudo descargar Excel');
    }
  };

  const calcWholesale = () => {
    const p = parseFloat(pct);
    if(isNaN(p)||p<0) {
      setDupAlert({ show:true, title:'Error de %', message:'Introduce % válido' });
      return;
    }
    setRows(rs=>rs.map(r=>{
      const pr = parseFloat(r.precio);
      return { ...r, precioMayorista: isNaN(pr)?'':(pr*(p/100)).toFixed(2) };
    }));
  };

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive"/>
      <main className="text-gray-800 min-h-screen">
        <div className="container mx-auto p-4">
          <header className="text-center mb-6">
            <h1 className="text-3xl font-bold">Inventario de Productos</h1>
            <p className="text-gray-600">Carga, edita y guarda. Avisos de IDs y nombres similares.</p>
          </header>

          {/* Barra acciones */}
          <div className="sticky-nav bg-gray-50/80 backdrop-blur p-3 rounded-md mb-4 flex flex-wrap gap-2 items-center">
            <button onClick={addRow}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded">+ Añadir Fila</button>
            <button onClick={()=>filePDFRef.current.click()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded">
              Cargar Inventario A2
            </button>
            <input type="file" accept="application/pdf"
              ref={filePDFRef} className="hidden" onChange={onPDFChange} />

            <button onClick={loadExcel}
              className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded">Cargar Excel</button>
            <input type="file" accept=".xlsx,.xls,.csv"
              ref={fileInputRef} className="hidden" onChange={onFileChange} />

            <button onClick={saveExcel}
              className="bg-teal-600 hover:bg-teal-700 text-white py-1 px-3 rounded">Guardar como Excel</button>

            <div className="ml-auto flex items-center gap-2">
              <input type="number" placeholder="%" className="w-20 p-1 border rounded"
                value={pct} onChange={e=>setPct(e.target.value)}/>
              <button onClick={calcWholesale}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded">
                Calcular %
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto bg-white rounded shadow border">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  {['ID','Nombre','Cantidad','Precio','Precio Mayorista'].map((h,i)=>
                    <th key={i} className="p-2 text-left text-sm font-semibold text-gray-600 border-b">
                      {h}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-1"><input className="w-full" type="text"
                      value={r.id} onChange={e=>onCellChange(i,'id',e.target.value)}/></td>

                    <td className="p-1 relative">
                      <input className="w-full" type="text"
                        value={r.nombre} onChange={e=>onCellChange(i,'nombre',e.target.value)}/>
                      {simAlert.group.includes(i) && (
                        <div className="absolute bottom-1 right-1 text-amber-500 cursor-pointer"
                          onClick={()=>setSimAlert(s=>({...s, show:true}))}>⚠</div>
                      )}
                    </td>

                    {['cantidad','precio','precioMayorista'].map((f,j)=>
                      <td key={j} className="p-1">
                        <input className="w-full" type="number"
                          value={r[f]} onChange={e=>onCellChange(i,f,e.target.value)}/>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modales */}
          {dupAlert.show && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded shadow-md max-w-sm text-center">
                <h3 className="font-bold">{dupAlert.title}</h3>
                <p className="mt-2">{dupAlert.message}</p>
                <button onClick={closeDup}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded">
                  Entendido
                </button>
              </div>
            </div>
          )}
          {simAlert.show && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded shadow-md max-w-lg">
                <h3 className="font-bold mb-2">Nombres Similares</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  {simAlert.group.map(i=>
                    <li key={i}>Fila {i+1}: "{rows[i].nombre}"</li>
                  )}
                </ul>
                <button onClick={closeSim}
                  className="mt-4 bg-amber-600 hover:bg-amber-700 text-white py-1 px-3 rounded">
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
