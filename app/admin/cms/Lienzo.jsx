import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

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
        setContent(data.content || '');
      } catch (err) {
        console.error('Error al cargar archivo:', err);
      }
    };
    cargar();
  }, [file]);

  const guardar = async () => {
    try {
      await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, content })
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
    setContent(formatHTML(html));
  };

  useEffect(() => {
    if (!editorRef.current) return;
    if (modoEditor !== 'visual') return;
    if (preventNextSync.current) {
      preventNextSync.current = false;
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }, 100);
  }, [content, modoEditor]);

  useEffect(() => {
    if (modoEditor === 'visual' && editorRef.current) {
      editorRef.current.innerHTML = content;
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
    setSelectedElement(el);
    setSelectedStyles({
      tag: el.tagName,
      display: styles.display,
      margin: styles.margin,
      padding: styles.padding,
      border: styles.border,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      textAlign: styles.textAlign,
      width: styles.width,
      height: styles.height,
      cursor: styles.cursor,
    });
  };

  const actualizarEstilo = (prop, valor) => {
    if (!selectedElement) return;
    selectedElement.style[prop] = valor;
    setContent(editorRef.current.innerHTML);
    setSelectedStyles(prev => ({ ...prev, [prop]: valor }));
  };

  const aplicarEstilosTailwind = () => {
    if (!selectedElement) return;

    if (!tailwindMode) {
      let clases = [];

      if (selectedElement.style.margin) clases.push('m-4');
      if (selectedElement.style.padding) clases.push('p-4');
      if (selectedElement.style.border) clases.push('border');
      if (selectedElement.style.color) clases.push('text-red-500');
      if (selectedElement.style.backgroundColor) clases.push('bg-gray-100');

      selectedElement.removeAttribute('style');
      selectedElement.className = clases.join(' ');
    } else {
      selectedElement.className = '';
      for (const prop in selectedStyles) {
        if (prop !== 'tag') {
          selectedElement.style[prop] = selectedStyles[prop];
        }
      }
    }

    setTailwindMode(!tailwindMode);
    setContent(editorRef.current.innerHTML);
  };

  // Escucha clics y simula uno al cambiar de modo
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleClick = (e) => {
      const target = e.target.closest('*');
      if (target && target !== editor) handleElementClick(e);
    };

    editor.addEventListener('click', handleClick);

    if (modoEditor === 'visual') {
      // Asegura que ya existe el contenido en el editor antes del clic simulado
      setTimeout(() => {
        const primerElemento = editor.querySelector('*');
        if (primerElemento) {
          const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          primerElemento.dispatchEvent(event);
        }
      }, 50); // pequeño delay asegura orden de efectos
    }

    return () => {
      editor.removeEventListener('click', handleClick);
    };
  }, [modoEditor]);

  // Clases comunes para botones más pequeños que el de guardar
  const btnSmall = "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button className={btnSmall} onClick={() => insertHTML('<h1>Título H1</h1>')}>H1</button>
        <button className={btnSmall} onClick={() => insertHTML('<p>Párrafo nuevo</p>')}>Párrafo</button>
        <button className={btnSmall} onClick={() => insertHTML('<ul><li>Item 1</li><li>Item 2</li></ul>')}>Lista</button>
        <button className={btnSmall} onClick={() => insertHTML('<img src="https://via.placeholder.com/150" />')}>Imagen</button>
        <button className={btnSmall} onClick={nuevoArchivo}>Nuevo archivo</button>
        <button className={btnSmall} onClick={() => setModoEditor(modoEditor === 'visual' ? 'codigo' : 'visual')}>
          {modoEditor === 'visual' ? 'Ver Código' : 'Ver Visual'}
        </button>
      </div>

      {/* Solo mostramos configuraciones y tailwind si estamos en modo visual */}
      {modoEditor === 'visual' && (
        <div className="border p-4">
          <strong>Estilos del elemento seleccionado:</strong>
          {selectedStyles.tag ? (
            <div className="flex flex-col gap-2 mt-2">
              <span><strong>Etiqueta:</strong> {selectedStyles.tag}</span>
              {[
                { label: 'Display', prop: 'display' },
                { label: 'Margin', prop: 'margin' },
                { label: 'Padding', prop: 'padding' },
                { label: 'Border', prop: 'border' },
                { label: 'Color', prop: 'color' },
                { label: 'Background Color', prop: 'backgroundColor' },
                { label: 'Font Size', prop: 'fontSize' },
                { label: 'Font Weight', prop: 'fontWeight' },
                { label: 'Text Align', prop: 'textAlign' },
                { label: 'Width', prop: 'width' },
                { label: 'Height', prop: 'height' },
                { label: 'Cursor', prop: 'cursor' },
              ].map(({ label, prop }) => (
                <label key={prop} className="flex flex-col">
                  {label}:
                  <input
                    type="text"
                    value={selectedStyles[prop] || ''}
                    onChange={(e) => actualizarEstilo(prop, e.target.value)}
                    className="border rounded p-1 mt-1"
                  />
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
