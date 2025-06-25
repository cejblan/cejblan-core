// Vista combinada: Editor de código (Monaco) y editor visual (tipo Canva) sincronizados
// Ambos modifican el mismo archivo y se actualizan mutuamente

import { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ file }) {
  const [content, setContent] = useState('');
  const editorRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cargar archivo
  useEffect(() => {
    fetch(`/api/cms/read?file=${file}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setContent(data.content);
      });
  }, [file]);

  // Guardar archivo
  const guardar = async () => {
    await fetch('/api/cms/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, content })
    });
  };

  // Actualizar contenido desde el editor visual
  const handleVisualInput = () => {
    const html = editorRef.current.innerHTML;
    setContent(html);
  };

  // Sincronizar editor visual cuando cambia el contenido
  useEffect(() => {
    if (editorRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        editorRef.current.innerHTML = content;
      }, 100);
    }
  }, [content]);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Editor de código */}
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

      {/* Editor visual tipo Canva */}
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

      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
        <button onClick={guardar}>Guardar</button>
      </div>
    </div>
  );
}