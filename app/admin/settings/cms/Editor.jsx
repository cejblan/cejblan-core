import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ file }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/api/cms/read?file=${file}`)
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.text();
          console.error('Error leyendo archivo:', error);
          return;
        }
        const data = await res.json();
        setContent(data.content);
      })
      .catch((err) => {
        console.error('Error de red:', err);
      });
  }, [file]);  

  const saveFile = () => {
    fetch('/api/cms/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, content })
    });
  };

  return (
    <div>
      <MonacoEditor
        height="500px"
        defaultLanguage="html"
        value={content}
        onChange={(value) => setContent(value)}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false
        }}
      />
      <button onClick={saveFile} style={{ marginTop: '10px' }}>Guardar</button>
    </div>
  );
}
