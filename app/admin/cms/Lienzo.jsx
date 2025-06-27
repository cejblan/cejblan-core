import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { FiLayout, FiType, FiDroplet, FiBox, FiGrid, FiSquare, FiSliders } from 'react-icons/fi';

const TAILWIND_MAP = {
  padding: {
    p: ['p-0', 'p-2', 'p-4', 'p-6', 'p-8'],
    px: ['px-0', 'px-2', 'px-4', 'px-6', 'px-8'],
    py: ['py-0', 'py-2', 'py-4', 'py-6', 'py-8'],
    pt: ['pt-0', 'pt-2', 'pt-4', 'pt-6', 'pt-8'],
    pb: ['pb-0', 'pb-2', 'pb-4', 'pb-6', 'pb-8'],
    pl: ['pl-0', 'pl-2', 'pl-4', 'pl-6', 'pl-8'],
    pr: ['pr-0', 'pr-2', 'pr-4', 'pr-6', 'pr-8']
  },
  margin: {
    m: ['m-0', 'm-2', 'm-4', 'm-6', 'm-8'],
    mx: ['mx-0', 'mx-2', 'mx-4', 'mx-6', 'mx-8'],
    my: ['my-0', 'my-2', 'my-4', 'my-6', 'my-8'],
    mt: ['mt-0', 'mt-2', 'mt-4', 'mt-6', 'mt-8'],
    mb: ['mb-0', 'mb-2', 'mb-4', 'mb-6', 'mb-8'],
    ml: ['ml-0', 'ml-2', 'ml-4', 'ml-6', 'ml-8'],
    mr: ['mr-0', 'mr-2', 'mr-4', 'mr-6', 'mr-8']
  },
  border: ['border', 'border-2', 'border-4', 'border-8', 'border-none'],
  borderColor: ['border-black', 'border-white', 'border-gray-500', 'border-red-500', 'border-green-500', 'border-blue-500'],
  borderRadius: [
    'rounded-none',
    'rounded-sm',
    'rounded',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
    'rounded-full'
  ],
  borderStyle: ['border-solid', 'border-dashed', 'border-dotted', 'border-double'],
  fontSize: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  fontWeight: ['font-thin', 'font-light', 'font-normal', 'font-medium', 'font-bold', 'font-extrabold'],
  textAlign: ['text-left', 'text-center', 'text-right', 'text-justify'],
  color: ['text-black', 'text-white', 'text-gray-700', 'text-red-500', 'text-green-500', 'text-blue-500'],
  backgroundColor: ['bg-white', 'bg-gray-100', 'bg-gray-200', 'bg-blue-200', 'bg-yellow-100', 'bg-red-100'],
  width: ['w-auto', 'w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-1/5'],
  height: ['h-auto', 'h-full', 'h-32', 'h-64', 'h-96'],
  cursor: ['cursor-default', 'cursor-pointer', 'cursor-not-allowed', 'cursor-move'],
  display: ['block', 'inline', 'inline-block', 'flex', 'grid', 'hidden'],
  gridTemplateColumns: ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-12'],
  gridTemplateRows: ['grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5', 'grid-rows-6', 'grid-rows-12'],
  backgroundImage: ['bg-none', 'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-t', 'bg-gradient-to-b']
};

const STYLE_GROUPS = {
  Espaciado: ['margin', 'padding'],
  Tipografía: ['fontSize', 'fontWeight', 'textAlign'],
  Colores: ['color', 'backgroundColor'],
  Dimensiones: ['width', 'height'],
  Grid: ['display', 'gridTemplateColumns', 'gridTemplateRows'],
  Borde: ['border', 'borderColor', 'borderRadius', 'borderStyle'],
  Misceláneos: ['cursor', 'backgroundImage']
};

const STYLE_TAB_ICONS = {
  Espaciado: <FiLayout className="inline mr-1" />,
  Tipografía: <FiType className="inline mr-1" />,
  Colores: <FiDroplet className="inline mr-1" />,
  Dimensiones: <FiBox className="inline mr-1" />,
  Grid: <FiGrid className="inline mr-1" />,
  Borde: <FiSquare className="inline mr-1" />,
  Misceláneos: <FiSliders className="inline mr-1" />
};

export default function Editor({ file }) {
  const [content, setContent] = useState('');
  const [selectedStyles, setSelectedStyles] = useState({});
  const [tailwindMode, setTailwindMode] = useState(false);
  const [modoEditor, setModoEditor] = useState('visual');
  const [mensaje, setMensaje] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [tabActivo, setTabActivo] = useState('Espaciado');

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const timeoutRef = useRef(null);
  const preventNextSync = useRef(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        if (!file) return;
        const res = await fetch(`/api/cms/read?file=${file}`);
        if (!res.ok) throw new Error('No se pudo leer el archivo');
        const data = await res.json();
        const htmlVisual = data.content
          .replace(/className=/g, 'class=')
          .replace(/<Image([^>]*)\/?>/gi, '<img$1 />')
          .replace(/<\/Image>/gi, '') // por si acaso hay mal cerradas
          .replace(/<Link([^>]*)>/gi, '<a$1>')
          .replace(/<\/Link>/gi, '</a>');

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

      // convertir img → Image y a → Link
      htmlContent = htmlContent
        .replace(/class=/g, 'className=')
        .replace(/<img([^>]*)\/?>/gi, '<Image$1 />')
        .replace(/<a([^>]*)>/gi, '<Link$1>')
        .replace(/<\/a>/gi, '</Link>');

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
    if (modoEditor === 'codigo') {
      const editor = monacoRef.current;
      if (editor) {
        const position = editor.getPosition();
        const range = new window.monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        );
        const id = { major: 1, minor: 1 };
        const op = {
          identifier: id,
          range,
          text: html,
          forceMoveMarkers: true,
        };
        editor.executeEdits("insert-html", [op]);
        const updatedContent = editor.getValue();
        setContent(updatedContent);
      }
      return;
    }

    // Editor visual
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

    if (el.tagName === 'IMG') {
      setImagenSeleccionada(el);
    } else {
      setImagenSeleccionada(null);
    }

    const styles = window.getComputedStyle(el);

    // Obtener clases del elemento
    const clases = el.className.split(' ').filter(Boolean);
    let tieneTailwind = false;

    // Regex genérica para detectar prefijos Tailwind
    const TAILWIND_REGEX = /^(m|p|w|h|text|bg|border|rounded|grid|gap|justify|items|place|flex|leading|tracking|font|z|top|left|right|bottom|inset|col|row|cursor|overflow|shadow|opacity|scale|translate|rotate|skew|transform|transition|duration|ease|delay|animate|select|appearance|outline|ring|visible|invisible|sr|hidden|block|inline|flex|grid|table|contents|list|float|clear|object|box|align|justify|order|space|divide|whitespace|break|bg|from|via|to|underline|line|decoration|shadow|fill|stroke|blur|brightness|contrast|drop|grayscale|hue|invert|saturate|sepia|filter|backdrop|backdrop-blur|backdrop-brightness|backdrop-contrast|backdrop-grayscale|backdrop-hue|backdrop-invert|backdrop-opacity|backdrop-saturate|backdrop-sepia|mix-blend)/;

    // Detección corregida: distinguir arrays y objetos en TAILWIND_MAP
    tieneTailwind = clases.some(clase =>
      TAILWIND_REGEX.test(clase) ||
      Object.values(TAILWIND_MAP).some(opciones =>
        Array.isArray(opciones)
          ? opciones.includes(clase)
          : Object.values(opciones).flat().includes(clase)
      )
    );

    setTailwindMode(tieneTailwind);

    // Preparar objeto con estilos o clases para inputs
    const nuevosSelectedStyles = { tag: el.tagName };

    Object.entries(TAILWIND_MAP).forEach(([prop, opciones]) => {
      if (tieneTailwind && prop !== 'backgroundImage') {
        if (Array.isArray(opciones)) {
          // Propiedad simple (array)
          const claseActiva = clases.find(c => opciones.includes(c)) || '';
          nuevosSelectedStyles[prop] = claseActiva;
        } else {
          // Propiedad con subgrupos
          Object.entries(opciones).forEach(([subgrupo, clasesDisponibles]) => {
            const claseActiva = clases.find(c => clasesDisponibles.includes(c)) || '';
            nuevosSelectedStyles[`${prop}-${subgrupo}`] = claseActiva;
          });
        }
      } else {
        // Estilos en línea (no modo Tailwind o backgroundImage)
        if (prop === 'backgroundImage') {
          const bg = styles.backgroundImage;
          const match = bg.match(/url\("?(.+?)"?\)/);
          nuevosSelectedStyles[prop] = match ? match[1] : '';
        } else if (prop === 'display') {
          nuevosSelectedStyles[prop] = styles.display || '';
        } else {
          nuevosSelectedStyles[prop] = styles[prop] || '';
        }
      }
    });

    setSelectedElement(el);
    setSelectedStyles(nuevosSelectedStyles);
  };

  const actualizarClaseTailwind = (prop, valor) => {
    if (!selectedElement) return;

    if (tailwindMode) {
      let current = selectedElement.className.split(' ').filter(Boolean);

      if (prop === 'display') {
        current = current.filter(c =>
          !['block', 'inline', 'inline-block', 'flex', 'grid', 'hidden'].includes(c)
        );
        if (valor) current.push(valor);
      } else if (prop === 'backgroundImage') {
        selectedElement.style.backgroundImage = valor ? `url("${valor}")` : '';
      } else {
        const [propBase, subgrupo] = prop.split('-');
        const clasesSubgrupo = Array.isArray(TAILWIND_MAP[propBase]) ? [] : (TAILWIND_MAP[propBase]?.[subgrupo] || []);

        current = current.filter(c => !clasesSubgrupo.includes(c));
        if (valor) current.push(valor);
      }

      selectedElement.className = current.join(' ');
    } else {
      if (prop === 'backgroundImage') {
        selectedElement.style.backgroundImage = valor ? `url("${valor}")` : '';
      } else if (prop === 'display') {
        selectedElement.style.display = valor || '';
      } else {
        selectedElement.style[prop] = valor || '';
      }
    }

    setContent(editorRef.current.innerHTML);
    setSelectedStyles(prev => ({ ...prev, [prop]: valor }));
  };

  const aplicarEstilosTailwind = () => {
    if (!selectedElement) return;

    const newMode = !tailwindMode;
    const estilos = window.getComputedStyle(selectedElement);
    const nuevosSelectedStyles = { tag: selectedElement.tagName };

    if (newMode === false) {
      selectedElement.className = '';
      Object.entries(TAILWIND_MAP).forEach(([prop, opciones]) => {
        if (prop === 'backgroundImage') {
          const match = estilos.backgroundImage.match(/url\("?(.+?)"?\)/);
          nuevosSelectedStyles[prop] = match ? match[1] : '';
        } else if (prop === 'display') {
          nuevosSelectedStyles[prop] = estilos.display || '';
        } else {
          nuevosSelectedStyles[prop] = estilos[prop] || '';
        }
      });
    } else {
      selectedElement.removeAttribute('style');
      Object.keys(TAILWIND_MAP).forEach(prop => {
        nuevosSelectedStyles[prop] = '';
      });
    }

    setTailwindMode(newMode);
    setSelectedStyles(nuevosSelectedStyles);
    setContent(editorRef.current.innerHTML);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (modoEditor === 'visual') {
      editor.addEventListener('click', handleElementClick);
    }
    return () => {
      editor.removeEventListener('click', handleElementClick);
    };
  }, [modoEditor]);

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
  const btnSmall2 = "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button className={btnSmall} onClick={() => insertHTML('<h1>Título H1</h1>')}>H1</button>
        <button className={btnSmall} onClick={() => insertHTML('<p>Párrafo nuevo</p>')}>Párrafo</button>
        <button className={btnSmall} onClick={() => insertHTML('<a href="https://ejemplo.com">Texto del enlace</a>')}>Enlace</button>
        <button className={btnSmall} onClick={() => insertHTML('<div>Contenido dentro de DIV</div>')}>Div</button>
        <button className={btnSmall} onClick={() => insertHTML('<section>Contenido dentro de SECTION</section>')}>Section</button>
        <button className={btnSmall} onClick={() => insertHTML('<ul><li>Item 1</li><li>Item 2</li></ul>')}>Lista</button>
        <button className={btnSmall} onClick={() => insertHTML('<img src=\"https://img.ejemplo.com/150\" />')}>Imagen</button>
        <button className={btnSmall2} onClick={nuevoArchivo}>Nuevo archivo</button>
        <button className={btnSmall2} onClick={() => setModoEditor(modoEditor === 'visual' ? 'codigo' : 'visual')}>
          {modoEditor === 'visual' ? 'Ver Código' : 'Ver Visual'}
        </button>
      </div>

      {modoEditor === 'visual' && selectedElement && (
        <div className="border p-4 bg-gray-50 rounded">
          <strong>Estilos del elemento seleccionado:</strong>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <span><strong>Etiqueta:</strong> {selectedStyles.tag}</span>
            <div className="mb-4 md:col-start-2 col-span-3">
              <div className="flex flex-wrap gap-2 border-b pb-2 mb-2">
                {Object.keys(STYLE_GROUPS).map((grupo) => (
                  <button
                    key={grupo}
                    onClick={() => setTabActivo(grupo)}
                    className={`px-3 py-1 rounded-t text-sm flex items-center gap-1 ${tabActivo === grupo
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    {STYLE_TAB_ICONS[grupo]}
                    {grupo}
                  </button>
                ))}
              </div>
              <div className="p-3 border rounded bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {STYLE_GROUPS[tabActivo].map((prop) => {
                    const opciones = TAILWIND_MAP[prop];
                    if (!opciones) return null;

                    // Ocultar ciertas propiedades en modo estilo en línea
                    if (
                      !tailwindMode &&
                      ['gridTemplateColumns', 'gridTemplateRows', 'borderColor', 'borderRadius', 'borderStyle'].includes(prop)
                    ) {
                      return null;
                    }

                    // Si tiene subgrupos (es un objeto)
                    if (tailwindMode && typeof opciones === 'object' && !Array.isArray(opciones)) {
                      return (
                        <div key={prop} className="col-span-full border rounded p-2 bg-gray-50">
                          <p className="font-semibold mb-2">{prop}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(opciones).map(([subgrupo, subOpciones]) => (
                              <label key={`${prop}-${subgrupo}`} className="flex flex-col text-sm">
                                {subgrupo}:
                                <select
                                  value={selectedStyles[`${prop}-${subgrupo}`] || ''}
                                  onChange={(e) => actualizarClaseTailwind(`${prop}-${subgrupo}`, e.target.value)}
                                  className="border rounded p-1 mt-1"
                                >
                                  <option value="">Seleccionar</option>
                                  {subOpciones.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Caso general (sin subgrupos)
                    return (
                      <label key={prop} className="flex flex-col text-sm">
                        {prop}:
                        {tailwindMode ? (
                          <select
                            value={selectedStyles[prop] || ''}
                            onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                            className="border rounded p-1 mt-1"
                          >
                            <option value="">Seleccionar</option>
                            {opciones.map((opt) => (
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
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={aplicarEstilosTailwind}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {tailwindMode ? 'Quitar TailwindCSS' : 'Usar TailwindCSS'}
            </button>
          </div>
        </div>
      )}
      {modoEditor === 'visual' && imagenSeleccionada && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <p className="mb-2 font-semibold">Subir imagen para: <code>{imagenSeleccionada.src}</code></p>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("image", file);

              try {
                const res = await fetch("/api/cms/upload-image", {
                  method: "POST",
                  body: formData,
                });
                const data = await res.json();
                if (data.secure_url) {
                  imagenSeleccionada.src = data.secure_url;
                  setContent(editorRef.current.innerHTML);
                  setImagenSeleccionada(null); // Oculta input después de cargar
                }
              } catch (err) {
                console.error("Error al subir imagen:", err);
              }
            }}
          />
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
              onMount={(editor) => {
                monacoRef.current = editor;
              }}
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
