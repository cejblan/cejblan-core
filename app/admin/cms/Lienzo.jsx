"use client"

import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { FiLayout, FiType, FiDroplet, FiBox, FiGrid, FiSquare, FiSliders } from 'react-icons/fi';
import { TbScanPosition } from "react-icons/tb";
import ModoEditor from './ModoEditor';
import GaleriaModal from "@/app/admin/components/GaleriaModal";

const TAILWIND_REGEX = /^[a-z]+(?:-[a-z0-9]+)+$/;

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
  borderColor: ['border-black', 'border-white', 'border-gray-500', 'border-red-500', 'border-green-500', 'border-[#6ed8bf]'],
  borderRadius: ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'],
  borderStyle: ['border-solid', 'border-dashed', 'border-dotted', 'border-double'],
  fontSize: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'],
  fontWeight: ['font-thin', 'font-light', 'font-normal', 'font-medium', 'font-bold', 'font-extrabold'],
  textAlign: ['text-left', 'text-center', 'text-right', 'text-justify'],
  color: ['text-black', 'text-white', 'text-gray-700', 'text-red-500', 'text-green-500', 'text-[#6ed8bf]'],
  backgroundColor: ['bg-white', 'bg-gray-100', 'bg-gray-200', 'bg-blue-200', 'bg-yellow-100', 'bg-red-100'],
  width: ['w-auto', 'w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-1/5'],
  height: ['h-auto', 'h-full', 'h-32', 'h-64', 'h-96'],
  cursor: ['cursor-default', 'cursor-pointer', 'cursor-not-allowed', 'cursor-move'],
  display: ['block', 'inline', 'inline-block', 'flex', 'grid', 'hidden'],
  gap: ['gap-0', 'gap-1', 'gap-2', 'gap-4', 'gap-6', 'gap-8'],
  colStart: ['col-start-1', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6'],
  colSpan: ['col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-full'],
  colEnd: ['col-end-1', 'col-end-2', 'col-end-3', 'col-end-4', 'col-end-5', 'col-end-6'],
  gridTemplateColumns: ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-12'],
  gridTemplateRows: ['grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5', 'grid-rows-6', 'grid-rows-12'],
  backgroundImage: ['bg-none', 'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-t', 'bg-gradient-to-b'],
  backgroundPosition: ['bg-center', 'bg-left', 'bg-right', 'bg-top', 'bg-bottom', 'bg-left-top', 'bg-right-bottom'],
  backgroundRepeat: ['bg-repeat', 'bg-no-repeat', 'bg-repeat-x', 'bg-repeat-y'],
  backgroundSize: ['bg-auto', 'bg-cover', 'bg-contain'],
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  zIndex: ['z-auto', 'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50'],
  top: ['top-0', 'top-2', 'top-4', 'top-8', 'top-16', 'top-auto'],
  left: ['left-0', 'left-2', 'left-4', 'left-8', 'left-16', 'left-auto'],
  right: ['right-0', 'right-2', 'right-4', 'right-8', 'right-16', 'right-auto'],
  bottom: ['bottom-0', 'bottom-2', 'bottom-4', 'bottom-8', 'bottom-16', 'bottom-auto'],
  overflow: ['overflow-visible', 'overflow-hidden', 'overflow-scroll', 'overflow-auto'],
  objectFit: ['object-fill', 'object-contain', 'object-cover', 'object-none', 'object-scale-down'],
};

const STYLE_GROUPS = {
  Espaciado: ['margin', 'padding'],
  Tipografía: ['fontSize', 'fontWeight', 'textAlign'],
  Colores: ['color', 'backgroundColor', 'paletaSitio'],
  Dimensiones: ['width', 'height'],
  Grid: ['display', 'gridTemplateColumns', 'gridTemplateRows', 'gap', 'colStart', 'colSpan', 'colEnd'],
  Borde: ['border', 'borderColor', 'borderRadius', 'borderStyle'],
  Misceláneos: [
    'cursor',
    'backgroundImage',
    'backgroundPosition',
    'backgroundRepeat',
    'backgroundSize'
  ],
  Posicionamiento: ['position', 'zIndex', 'top', 'left', 'right', 'bottom', 'overflow', 'objectFit'],
};

const STYLE_TAB_ICONS = {
  Espaciado: <FiLayout className="inline mr-1" />,
  Tipografía: <FiType className="inline mr-1" />,
  Colores: <FiDroplet className="inline mr-1" />,
  Dimensiones: <FiBox className="inline mr-1" />,
  Grid: <FiGrid className="inline mr-1" />,
  Borde: <FiSquare className="inline mr-1" />,
  Misceláneos: <FiSliders className="inline mr-1" />,
  Posicionamiento: <TbScanPosition className="inline mr-1" />,
};

const PALETA_COLORES = [
  '#000000', '#ffffff', '#f87171', '#facc15',
  '#34d399', '#60a5fa', '#c084fc', '#f472b6',
  '#6b7280', '#d1d5db'
];

export default function Editor({ file, contenido }) {
  const [content, setContent] = useState('');
  const [selectedStyles, setSelectedStyles] = useState({});
  const [tailwindMode, setTailwindMode] = useState(false);
  const [modoEditor, setModoEditor] = useState('visual');
  const [mensaje, setMensaje] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [tabActivo, setTabActivo] = useState('Espaciado');
  const [historial, setHistorial] = useState([]);
  const [indiceHistorial, setIndiceHistorial] = useState(-1);
  const [mostrandoEditorPaleta, setMostrandoEditorPaleta] = useState(false);
  const [paletaUsuario, setPaletaUsuario] = useState([]);
  const [logoURL, setLogoURL] = useState(null);

  const [mostrandoModalGuardar, setMostrandoModalGuardar] = useState(false);
  const [nombreCommit, setNombreCommit] = useState('');
  const [descripcionCommit, setDescripcionCommit] = useState('');
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const timeoutRef = useRef(null);
  const preventNextSync = useRef(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        let raw = contenido;
        // Extraer bloque entre los marcadores
        const inicio = raw.indexOf("// ===START_RETURN===");
        const fin = raw.indexOf("// ===END_RETURN===");

        if (inicio !== -1 && fin !== -1 && fin > inicio) {
          const fragmentoReturn = raw
            .substring(inicio, fin)
            .replace(/\/\/ ===START_RETURN===/, "")
            .trim();

          // Transformar JSX a HTML editable
          const htmlVisual = fragmentoReturn
            .replace(/onClick=\{([^\}]+)\}/g, 'data-onclick="$1"')
            .replace(/<FaRegWindowMinimize(\s[^>]*)?\/>/g, '<i data-icon="FaRegWindowMinimize"$1></i>')
            .replace(/<FaRegWindowMaximize(\s[^>]*)?\/>/g, '<i data-icon="FaRegWindowMaximize"$1></i>')
            .replace(/<FaRegWindowClose(\s[^>]*)?\/>/g, '<i data-icon="FaRegWindowClose"$1></i>')
            .replace(/className=/g, 'class=')
            .replace(/<Image([^>]*)\/?>/g, '<img$1>')
            .replace(/<\/Image>/g, '')
            .replace(/<Link([^>]*)>/g, '<a$1>')
            .replace(/<\/Link>/g, '</a>');

          setContent(htmlVisual);
        } else {
          console.warn("No se encontró bloque // ===START_RETURN=== o // ===END_RETURN===");
          setContent(""); // Por seguridad
        }
      } catch (err) {
        console.error("Error al cargar archivo:", err);
      }
    };

    cargar();
  }, [contenido]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/admin/settings`);
        const data = await response.json();

        const setting = data.find(item => item.name === "paleta_colores");
        let paleta = [];

        const logoSetting = data.find(item => item.name === "logo_sitio");
        if (logoSetting?.value) setLogoURL(logoSetting.value);

        if (Array.isArray(setting?.value)) {
          paleta = setting.value;
        } else if (typeof setting?.value === 'string') {
          try {
            const parsed = JSON.parse(setting.value);
            if (Array.isArray(parsed)) {
              paleta = parsed;
            } else {
              paleta = setting.value.split(',').map(c => c.trim());
            }
          } catch (e) {
            paleta = setting.value.split(',').map(c => c.trim());
          }
        }

        setPaletaUsuario(paleta);
      } catch (error) {
        console.error("Error al cargar ajustes:", error);
      }
    };

    fetchSettings();
  }, []);

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

  const guardar = async () => {
    try {
      // convertir img → Image y a → Link
      const htmlToJSX = content
        .replace(/data-onclick="([^"]+)"/g, (match, fn) => {
          const trimmed = fn.trim();
          if (trimmed.startsWith('() =>') || trimmed.startsWith('function')) {
            return `onClick={${trimmed}}`;
          } else {
            return `onClick={() => ${trimmed}}`;
          }
        })
        .replace(/<i[^>]*data-icon=["']FaRegWindowMinimize["']([^>]*)><\/i>/g, '<FaRegWindowMinimize$1/>')
        .replace(/<i[^>]*data-icon=["']FaRegWindowMaximize["']([^>]*)><\/i>/g, '<FaRegWindowMaximize$1/>')
        .replace(/<i[^>]*data-icon=["']FaRegWindowClose["']([^>]*)><\/i>/g, '<FaRegWindowClose$1/>')
        .replace(/class=/g, 'className=')
        .replace(/<img([^>]*)\s*>/gi, '<Image$1>')
        .replace(/<a([^>]*)>/g, "<Link$1>")
        .replace(/<\/a>/g, "</Link>");

      let codigoCompleto = contenido;

      const inicio = codigoCompleto.indexOf("// ===START_RETURN===");
      const fin = codigoCompleto.indexOf("// ===END_RETURN===");

      if (inicio !== -1 && fin !== -1 && fin > inicio) {
        const antes = codigoCompleto.substring(0, inicio);
        const finMarcador = fin + "// ===END_RETURN===".length;
        const despues = codigoCompleto.substring(finMarcador);

        const nuevoContenido = `${antes}// ===START_RETURN===\n${htmlToJSX}\n// ===END_RETURN===${despues}`;

        // Guardar en backend
        await fetch("/api/github/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: file,
            content: nuevoContenido,
            commitMessage: nombreCommit,
            description: descripcionCommit,
          }),
        });

        setMensaje("Cambios guardados correctamente");
      } else {
        console.error("No se encontraron los marcadores de bloque en el archivo original");
      }
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const handleVisualInput = () => {
    preventNextSync.current = true;
    const html = editorRef.current.innerHTML;
    registrarCambio(editorRef.current.innerHTML);

    setContent(
      tailwindMode ? html.replace(/class=/g, 'className=') : html
    );
  };

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
      e.preventDefault();
      setImagenSeleccionada(el);      // guarda la referencia
      setMostrandoEditorPaleta(false); // oculta paleta si estaba abierta
      setTabActivo('Colores');         // opcional: cambia pestaña
      return setGaleriaAbierta(true);  // abre galería directamente
    }

    setImagenSeleccionada(null);

    // ...lógica original para tailwind y estilos
    const styles = window.getComputedStyle(el);
    const clases = el.className.split(' ').filter(Boolean);
    let tieneTailwind = clases.some(clase =>
      TAILWIND_REGEX.test(clase) ||
      Object.values(TAILWIND_MAP).some(opciones =>
        Array.isArray(opciones)
          ? opciones.includes(clase)
          : Object.values(opciones).flat().includes(clase)
      )
    );

    const nuevosSelectedStyles = { tag: el.tagName };
    Object.entries(TAILWIND_MAP).forEach(([prop, opciones]) => {
      if (tieneTailwind && prop !== 'backgroundImage') {
        if (Array.isArray(opciones)) {
          const claseActiva = clases.find(c => opciones.includes(c)) || '';
          nuevosSelectedStyles[prop] = claseActiva;
        } else {
          Object.entries(opciones).forEach(([subgrupo, clasesDisponibles]) => {
            const claseActiva = clases.find(c => clasesDisponibles.includes(c)) || '';
            nuevosSelectedStyles[`${prop}-${subgrupo}`] = claseActiva;
          });
        }
      } else {
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

    setTailwindMode(tieneTailwind);
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

  const registrarCambio = (nuevoContenido) => {
    const nuevoHistorial = historial.slice(0, indiceHistorial + 1);
    nuevoHistorial.push(nuevoContenido);
    setHistorial(nuevoHistorial);
    setIndiceHistorial(nuevoHistorial.length - 1);
  };

  const deshacer = () => {
    if (indiceHistorial > 0) {
      const nuevoIndice = indiceHistorial - 1;
      setIndiceHistorial(nuevoIndice);
      setContent(historial[nuevoIndice]);
    }
  };

  const rehacer = () => {
    if (indiceHistorial < historial.length - 1) {
      const nuevoIndice = indiceHistorial + 1;
      setIndiceHistorial(nuevoIndice);
      setContent(historial[nuevoIndice]);
    }
  };

  const btnSmall = "bg-[#6ed8bf] text-white px-2 py-1 rounded hover:bg-[#6ed8bf] transition h-fit";
  const btnSmall2 = "bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition";
  const btnSmall3 = "bg-red-600 text-white px-2 py-1 rounded mr-1 hover:bg-red-700 transition";

  return (
    <div className="flex flex-col gap-2 px-2 sm:px-0">
      {/* Editor visual/código */}
      <ModoEditor
        modoEditor={modoEditor}
        selectedElement={selectedElement}
        selectedStyles={selectedStyles}
        STYLE_GROUPS={STYLE_GROUPS}
        STYLE_TAB_ICONS={STYLE_TAB_ICONS}
        tabActivo={tabActivo}
        setTabActivo={setTabActivo}
        TAILWIND_MAP={TAILWIND_MAP}
        tailwindMode={tailwindMode}
        paletaUsuario={paletaUsuario}
        actualizarClaseTailwind={actualizarClaseTailwind}
        PALETA_COLORES={PALETA_COLORES}
        aplicarEstilosTailwind={aplicarEstilosTailwind}
        imagenSeleccionada={imagenSeleccionada}
        setImagenSeleccionada={setImagenSeleccionada}
        editorRef={editorRef}
        setContent={setContent}
        insertHTML={insertHTML}
        btnSmall={btnSmall}
        btnSmall2={btnSmall2}
        btnSmall3={btnSmall3}
        setMostrandoEditorPaleta={setMostrandoEditorPaleta}
        mostrandoEditorPaleta={mostrandoEditorPaleta}
        setPaletaUsuario={setPaletaUsuario}
        setModoEditor={setModoEditor}
        deshacer={deshacer}
        rehacer={rehacer}
        indiceHistorial={indiceHistorial}
        historial={historial}
        MonacoEditor={MonacoEditor}
        monacoRef={monacoRef}
        handleVisualInput={handleVisualInput}
        registrarCambio={registrarCambio}
        logoURL={logoURL}
        setLogoURL={setLogoURL}
        content={content}
        galeriaAbierta={galeriaAbierta}
        setGaleriaAbierta={setGaleriaAbierta}
      />
      <GaleriaModal
        abierto={galeriaAbierta}
        onClose={() => setGaleriaAbierta(false)}
        onSelect={(url) => {
          // si es el logo:
          if (imagenSeleccionada === 'logo') {
            setLogoURL(url);
          }
          // si es una <img> seleccionada en el editor:
          else if (imagenSeleccionada?.src !== undefined) {
            imagenSeleccionada.src = url;
            setContent(editorRef.current.innerHTML);
          }
          // cerrar modal y limpiar selección
          setGaleriaAbierta(false);
          setImagenSeleccionada(null);
        }}
      />
      {/* Guardar cambios */}
      <div className="text-center">
        {mensaje && <p className="text-green-600 my-2">{mensaje}</p>}
        <button
          onClick={() => setMostrandoModalGuardar(true)}
          className="bg-green-600 text-white py-2 px-4 mb-2 rounded hover:bg-green-700 transition"
        >
          Guardar
        </button>
        {mostrandoModalGuardar && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-2">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <button
                onClick={() => setMostrandoModalGuardar(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
              <input
                type="text"
                value={nombreCommit}
                onChange={e => setNombreCommit(e.target.value)}
                placeholder="Nombre del commit"
                className="block w-full border border-gray-300 rounded px-3 py-2 mb-4"
              />
              <textarea
                value={descripcionCommit}
                onChange={e => setDescripcionCommit(e.target.value)}
                placeholder="Descripción detallada del commit"
                rows={4}
                className="block w-full border border-gray-300 rounded px-3 py-2 mb-2 resize-none"
              />
              <p className="text-xs text-gray-500 mb-4">
                Los cambios se guardarán con el prefijo <strong>(CMS)</strong>
              </p>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    await guardar();
                    setMostrandoModalGuardar(false);
                    setNombreCommit('');
                    setDescripcionCommit('');
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}