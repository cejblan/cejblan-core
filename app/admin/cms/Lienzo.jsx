import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

const TAILWIND_MAP = {
  margin: ['m-0', 'm-2', 'm-4', 'm-6', 'm-8'],
  padding: ['p-0', 'p-2', 'p-4', 'p-6', 'p-8'],
  border: ['border', 'border-2', 'border-4', 'border-none'],
  fontSize: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'],
  fontWeight: ['font-light', 'font-normal', 'font-bold', 'font-extrabold'],
  textAlign: ['text-left', 'text-center', 'text-right', 'text-justify'],
  color: ['text-black', 'text-white', 'text-red-500', 'text-green-500'],
  backgroundColor: ['bg-white', 'bg-gray-100', 'bg-blue-200', 'bg-yellow-100'],
  width: ['w-auto', 'w-full', 'w-1/2', 'w-1/3'],
  height: ['h-auto', 'h-full', 'h-64', 'h-96'],
  cursor: ['cursor-default', 'cursor-pointer', 'cursor-not-allowed']
};

export default function Editor({ file }) {
  const [content, setContent] = useState('');
  const [selectedStyles, setSelectedStyles] = useState({});
  const [tailwindMode, setTailwindMode] = useState(false);
  const [modoEditor, setModoEditor] = useState('visual');
  const [mensaje, setMensaje] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);

  const editorRef = useRef(null);
  const timeoutRef = useRef(null);
  const preventNextSync = useRef(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        if (!file) return;
        const res = await fetch(`/api/cms/read?file=${file}`);
        if (!res.ok) throw new Error('No se pudo leer el archivo');
        const data = await res.json();
        const htmlVisual = data.content.replace(/className=/g, 'class=');
        setContent(htmlVisual);
      } catch (err) {
        console.error('Error al cargar archivo:', err);
      }
    };
    cargar();
  }, [file]);

  const guardar = async () => {
    try {
      let htmlContent = content;
      if (tailwindMode) {
        htmlContent = htmlContent.replace(/class=/g, 'className=');
      }

      await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, content: htmlContent })
      });

      setMensaje('Documento actualizado correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const nuevoArchivo = async () => {
    const nombre = prompt('Nombre del nuevo archivo (ej: nuevo.html):');
    if (!nombre || !nombre.trim()) return;

    try {
      await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: nombre.trim(), content: '' })
      });
      setMensaje(`Archivo "${nombre}" creado`);
      setTimeout(() => setMensaje(''), 3000);
      window.location.href = `?file=${nombre}`;
    } catch (err) {
      console.error('Error al crear archivo:', err);
    }
  };

  const handleVisualInput = () => {
    preventNextSync.current = true;
    const html = editorRef.current.innerHTML;
    setContent(
      tailwindMode ? html.replace(/class=/g, 'className=') : html
    );
  };

  useEffect(() => {
    if (!editorRef.current || modoEditor !== 'visual') return;
    if (preventNextSync.current) {
      preventNextSync.current = false;
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const safeContent = tailwindMode
        ? content.replace(/className=/g, 'class=')
        : content;

      if (editorRef.current.innerHTML !== safeContent) {
        editorRef.current.innerHTML = safeContent;
      }
    }, 100);
  }, [content, modoEditor]);

  useEffect(() => {
    if (modoEditor === 'visual' && editorRef.current) {
      editorRef.current.innerHTML = tailwindMode
        ? content.replace(/className=/g, 'class=')
        : content;
    }
  }, [modoEditor]);

  const insertHTML = (html) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const frag = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      frag.appendChild(tempDiv.firstChild);
    }
    range.insertNode(frag);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    setContent(editorRef.current.innerHTML);
  };

  const formatHTML = (html) => html.replace(/></g, '>\n<').trim();

  const handleElementClick = (e) => {
    const el = e.target;
    if (!el || el === editorRef.current) return;

    const styles = window.getComputedStyle(el);

    // Obtener clases del elemento
    const clases = el.className.split(' ').filter(Boolean);
    let tieneTailwind = false;

    // Detectar si alguna clase pertenece a Tailwind
    outer:
    for (const opciones of Object.values(TAILWIND_MAP)) {
      for (const clase of clases) {
        if (opciones.includes(clase)) {
          tieneTailwind = true;
          break outer;
        }
      }
    }

    // Actualizar estado de tailwindMode según detección
    setTailwindMode(tieneTailwind);

    // Preparar objeto con estilos o clases para precargar inputs
    const nuevosSelectedStyles = { tag: el.tagName };

    Object.entries(TAILWIND_MAP).forEach(([prop, opciones]) => {
      if (tieneTailwind) {
        // Busca la clase Tailwind correspondiente para esta propiedad
        const claseEncontrada = opciones.find(c => clases.includes(c)) || '';
        nuevosSelectedStyles[prop] = claseEncontrada;
      } else {
        // Si no tiene Tailwind, usa estilo computado CSS
        nuevosSelectedStyles[prop] = styles[prop] || '';
      }
    });

    setSelectedElement(el);
    setSelectedStyles(nuevosSelectedStyles);
  };

  const actualizarClaseTailwind = (prop, valor) => {
    if (!selectedElement) return;

    if (tailwindMode) {
      // Aplica clases de Tailwind
      let current = selectedElement.className.split(' ').filter(Boolean);
      current = current.filter(c => !TAILWIND_MAP[prop].includes(c));
      if (valor) current.push(valor);
      selectedElement.className = current.join(' ');
    } else {
      // Aplica estilos en línea
      selectedElement.style[prop] = valor || '';
    }

    setContent(editorRef.current.innerHTML);
    setSelectedStyles(prev => ({ ...prev, [prop]: valor }));
  };


  const aplicarEstilosTailwind = () => {
    if (!selectedElement) return;

    if (!tailwindMode) {
      selectedElement.removeAttribute('style');
      // No aplicar clases por defecto
    } else {
      selectedElement.className = '';
    }

    setTailwindMode(!tailwindMode);
    setContent(editorRef.current.innerHTML);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener('click', handleElementClick);
    return () => editor.removeEventListener('click', handleElementClick);
  }, []);

  useEffect(() => {
    if (modoEditor === 'visual' && editorRef.current) {
      const primerElemento = editorRef.current.querySelector('*');
      if (primerElemento) {
        const event = new MouseEvent('click', { bubbles: true });
        primerElemento.dispatchEvent(event);
      }
    }
  }, [modoEditor]);

  const btnSmall = "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button className={btnSmall} onClick={() => insertHTML('<h1>Título H1</h1>')}>H1</button>
        <button className={btnSmall} onClick={() => insertHTML('<p>Párrafo nuevo</p>')}>Párrafo</button>
        <button className={btnSmall} onClick={() => insertHTML('<ul><li>Item 1</li><li>Item 2</li></ul>')}>Lista</button>
        <button className={btnSmall} onClick={() => insertHTML('<img src=\"https://via.placeholder.com/150\" />')}>Imagen</button>
        <button className={btnSmall} onClick={nuevoArchivo}>Nuevo archivo</button>
        <button className={btnSmall} onClick={() => setModoEditor(modoEditor === 'visual' ? 'codigo' : 'visual')}>
          {modoEditor === 'visual' ? 'Ver Código' : 'Ver Visual'}
        </button>
      </div>

      {modoEditor === 'visual' && (
        <div className="border p-4">
          <strong>Estilos del elemento seleccionado:</strong>
          {selectedStyles.tag ? (
            <div className="flex flex-col gap-2 mt-2">
              <span><strong>Etiqueta:</strong> {selectedStyles.tag}</span>
              {Object.entries(TAILWIND_MAP).map(([prop, opciones]) => (
                <label key={prop} className="flex flex-col">
                  {prop}:
                  {tailwindMode ? (
                    <select
                      value={selectedStyles[prop] || ''}
                      onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                      className="border rounded p-1 mt-1"
                    >
                      <option value="">Seleccionar</option>
                      {opciones.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedStyles[prop] || ''}
                      onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                      className="border rounded p-1 mt-1"
                    />
                  )}
                </label>
              ))}
              <button
                onClick={aplicarEstilosTailwind}
                className="mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {tailwindMode ? 'Quitar TailwindCSS' : 'Usar TailwindCSS'}
              </button>
            </div>
          ) : (
            <p>No hay elemento seleccionado</p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        {modoEditor === 'codigo' ? (
          <div className="flex-1">
            <h3>Editor de código</h3>
            <MonacoEditor
              height="400px"
              defaultLanguage="html"
              value={content}
              onChange={(val) => setContent(val || '')}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
        ) : (
          <div className="flex-1">
            <h3>Editor visual</h3>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleVisualInput}
              className="border p-4 min-h-[400px] bg-white overflow-y-auto"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={guardar}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Guardar
        </button>
        {mensaje && <p className="text-green-600 mt-2">{mensaje}</p>}
      </div>
    </div>
  );
}
