import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ file }) {
  const [content, setContent] = useState('');
  const [selectedStyles, setSelectedStyles] = useState({});
  const [tailwindMode, setTailwindMode] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const editorRef = useRef(null);
  const timeoutRef = useRef(null);
  const preventNextSync = useRef(false);

  useEffect(() => {
    fetch(`/api/cms/read?file=${file}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setContent(data.content);
      });
  }, [file]);

  const guardar = async () => {
    await fetch('/api/cms/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, content })
    });
    setMensaje('Documento actualizado correctamente');
    setTimeout(() => setMensaje(''), 3000);
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
      editorRef.current.innerHTML = content;
    }, 100);
  }, [content]);

  const insertHTML = (html) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const block = document.createElement('div');
    block.innerHTML = html;
    block.style.display = 'block';
    block.style.width = '100%';
    block.style.textAlign = 'left';

    const frag = document.createDocumentFragment();
    while (block.firstChild) {
      frag.appendChild(block.firstChild);
    }
    range.insertNode(frag);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    setContent(editorRef.current.innerHTML);
  };

  const formatHTML = (html) => {
    const formatted = html
      .replace(/></g, '>' + String.fromCharCode(10) + '<')
      .trim();
    return formatted;
  };

  const handleElementClick = (e) => {
    const styles = window.getComputedStyle(e.target);
    setSelectedStyles({
      tag: e.target.tagName,
      display: styles.display,
      margin: styles.margin,
      padding: styles.padding,
      border: styles.border,
    });
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
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <strong>Estilos del elemento seleccionado:</strong>
        {selectedStyles.tag && (
          <ul>
            <li><strong>Etiqueta:</strong> {selectedStyles.tag}</li>
            <li><strong>Display:</strong> {selectedStyles.display}</li>
            <li><strong>Margin:</strong> {selectedStyles.margin}</li>
            <li><strong>Padding:</strong> {selectedStyles.padding}</li>
            <li><strong>Border:</strong> {selectedStyles.border}</li>
          </ul>
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
            onChange={(value) => setContent(value)}
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
