import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ file }) {
  const [content, setContent] = useState('');
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
  };

  const handleVisualInput = () => {
    preventNextSync.current = true;
    const html = editorRef.current.innerHTML;
    setContent(html);
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

    const spacer = document.createElement('br');

    const frag = document.createDocumentFragment();
    frag.appendChild(block);
    frag.appendChild(spacer);

    range.insertNode(frag);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    setContent(editorRef.current.innerHTML);
  };

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
              overflowY: 'auto'
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={guardar}>Guardar</button>
      </div>
    </div>
  );
}
