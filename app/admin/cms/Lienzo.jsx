import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ file }) {
  const [content, setContent] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState({});
  const [tailwindMode, setTailwindMode] = useState(false);
  const [mensaje, setMensaje] = useState('');

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
    if (preventNextSync.current) {
      preventNextSync.current = false;
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (editorRef.current && content !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = content;
      }
    }, 100);
  }, [content]);

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

  const formatHTML = (html) => {
    return html.replace(/></g, '>\n<').trim();
  };

  const handleElementClick = (e) => {
    const styles = window.getComputedStyle(e.target);
    setSelectedElement(e.target);
    setSelectedStyles({
      tag: e.target.tagName,
      display: styles.display,
      margin: styles.margin,
      padding: styles.padding,
      border: styles.border,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      fontStyle: styles.fontStyle,
      textDecoration: styles.textDecoration,
      textAlign: styles.textAlign,
      width: styles.width,
      height: styles.height,
      lineHeight: styles.lineHeight,
      letterSpacing: styles.letterSpacing,
    });
  };

  const actualizarEstilo = (prop, valor) => {
    if (!selectedElement) return;
    selectedElement.style[prop] = valor;
    setContent(editorRef.current.innerHTML);
    setSelectedStyles((prev) => ({ ...prev, [prop]: valor }));
  };

  const getColor = (element, prop) => {
    if (!element) return '#000000';
    const color = getComputedStyle(element)[prop];
    const hex = rgbToHex(color);
    return hex;
  };

  const rgbToHex = (rgb) => {
    if (!rgb || !rgb.startsWith('rgb')) return '#000000';
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener('click', handleElementClick);
    return () => editor.removeEventListener('click', handleElementClick);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        <button onClick={() => insertHTML('<h1>Título H1</h1>')}>H1</button>
        <button onClick={() => insertHTML('<h2>Subtítulo H2</h2>')}>H2</button>
        <button onClick={() => insertHTML('<p>Párrafo nuevo</p>')}>Párrafo</button>
        <button onClick={() => insertHTML('<ul><li>Elemento 1</li><li>Elemento 2</li></ul>')}>Lista</button>
        <button onClick={() => insertHTML('<table border="1"><tr><th>Col1</th><th>Col2</th></tr><tr><td>A</td><td>B</td></tr></table>')}>Tabla</button>
        <button onClick={() => insertHTML('<img src="https://via.placeholder.com/150" alt="imagen" />')}>Imagen</button>
        <button onClick={() => insertHTML('<a href="https://example.com">Enlace</a>')}>Enlace</button>
        <button onClick={() => insertHTML('<button>Botón</button>')}>Botón</button>
        <button onClick={() => insertHTML('<hr />')}>Separador</button>
        <button onClick={() => document.execCommand('bold')}>Negrita</button>
        <button onClick={() => document.execCommand('italic')}>Cursiva</button>
        <button onClick={() => document.execCommand('underline')}>Subrayado</button>
        <button onClick={nuevoArchivo}>Nuevo archivo</button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <strong>Estilos del elemento seleccionado:</strong>
        {selectedElement && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
            <div><strong>Etiqueta:</strong> {selectedStyles.tag}</div>

            <label>Display: <input type="text" value={selectedStyles.display || ''} onChange={(e) => actualizarEstilo('display', e.target.value)} /></label>
            <label>Margin: <input type="text" value={selectedStyles.margin || ''} onChange={(e) => actualizarEstilo('margin', e.target.value)} /></label>
            <label>Padding: <input type="text" value={selectedStyles.padding || ''} onChange={(e) => actualizarEstilo('padding', e.target.value)} /></label>
            <label>Border: <input type="text" value={selectedStyles.border || ''} onChange={(e) => actualizarEstilo('border', e.target.value)} /></label>

            <label>Color: <input type="color" value={getColor(selectedElement, 'color')} onChange={(e) => actualizarEstilo('color', e.target.value)} /></label>
            <label>Fondo: <input type="color" value={getColor(selectedElement, 'backgroundColor')} onChange={(e) => actualizarEstilo('backgroundColor', e.target.value)} /></label>

            <label>Tamaño fuente: <input type="text" value={selectedStyles.fontSize || ''} onChange={(e) => actualizarEstilo('fontSize', e.target.value)} /></label>
            <label>Peso fuente: <input type="text" value={selectedStyles.fontWeight || ''} onChange={(e) => actualizarEstilo('fontWeight', e.target.value)} /></label>

            <label>Estilo fuente:
              <select value={selectedStyles.fontStyle || ''} onChange={(e) => actualizarEstilo('fontStyle', e.target.value)}>
                <option value="">normal</option>
                <option value="italic">italic</option>
                <option value="oblique">oblique</option>
              </select>
            </label>

            <label>Decoración:
              <select value={selectedStyles.textDecoration || ''} onChange={(e) => actualizarEstilo('textDecoration', e.target.value)}>
                <option value="">ninguna</option>
                <option value="underline">subrayado</option>
                <option value="line-through">tachado</option>
                <option value="overline">línea arriba</option>
              </select>
            </label>

            <label>Alineación:
              <select value={selectedStyles.textAlign || ''} onChange={(e) => actualizarEstilo('textAlign', e.target.value)}>
                <option>left</option>
                <option>center</option>
                <option>right</option>
                <option>justify</option>
              </select>
            </label>

            <label>Ancho: <input type="text" value={selectedStyles.width || ''} onChange={(e) => actualizarEstilo('width', e.target.value)} /></label>
            <label>Alto: <input type="text" value={selectedStyles.height || ''} onChange={(e) => actualizarEstilo('height', e.target.value)} /></label>
            <label>Altura línea: <input type="text" value={selectedStyles.lineHeight || ''} onChange={(e) => actualizarEstilo('lineHeight', e.target.value)} /></label>
            <label>Espaciado letras: <input type="text" value={selectedStyles.letterSpacing || ''} onChange={(e) => actualizarEstilo('letterSpacing', e.target.value)} /></label>
          </div>
        )}
        <button onClick={() => setTailwindMode(!tailwindMode)}>
          {tailwindMode ? 'Usar estilos inline' : 'Usar TailwindCSS'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Editor de código</h3>
          <MonacoEditor
            height="400px"
            defaultLanguage="html"
            value={content}
            onChange={(value) => setContent(value || '')}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h3>Editor visual</h3>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleVisualInput}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              minHeight: '400px',
              background: '#fff',
              overflowY: 'auto',
              textAlign: 'left'
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={guardar}>Guardar</button>
        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      </div>
    </div>
  );
}