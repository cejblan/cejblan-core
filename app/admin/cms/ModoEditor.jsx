import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import ImageNotSupported from "public/ImageNotSupported.webp"

export default function ModoEditor({
  modoEditor,
  selectedElement,
  selectedStyles,
  STYLE_GROUPS,
  STYLE_TAB_ICONS,
  tabActivo,
  setTabActivo,
  TAILWIND_MAP,
  tailwindMode,
  paletaUsuario,
  actualizarClaseTailwind,
  PALETA_COLORES,
  aplicarEstilosTailwind,
  imagenSeleccionada,
  setImagenSeleccionada,
  editorRef,
  setContent,
  insertHTML,
  btnSmall,
  btnSmall2,
  btnSmall3,
  setMostrandoEditorPaleta,
  mostrandoEditorPaleta,
  setPaletaUsuario,
  setModoEditor,
  deshacer,
  rehacer,
  indiceHistorial,
  historial,
  MonacoEditor,
  monacoRef,
  handleVisualInput,
  registrarCambio,
  logoURL,
  setLogoURL,
  content,
  galeriaAbierta,
  setGaleriaAbierta,
}) {
  const porPagina = 36;
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="md:col-span-4 gap-2 flex flex-col">
          <div className="flex flex-wrap gap-2">
            {/* Botones rápidos */}
            <button className={btnSmall} onClick={() => insertHTML('<h1>Título H1</h1>')}>H1</button>
            <button className={btnSmall} onClick={() => insertHTML('<p>Párrafo nuevo</p>')}>Párrafo</button>
            <button className={btnSmall} onClick={() => insertHTML('<a href="https://ejemplo.com">Texto del enlace</a>')}>Enlace</button>
            <button className={btnSmall} onClick={() => insertHTML('<div>Contenido dentro de DIV</div>')}>Div</button>
            <button className={btnSmall} onClick={() => insertHTML('<section>Contenido dentro de SECTION</section>')}>Section</button>
            <button className={btnSmall} onClick={() => insertHTML('<ul><li>Item 1</li><li>Item 2</li></ul>')}>Lista</button>
            <button className={btnSmall} onClick={() => insertHTML('<img src="https://img.ejemplo.com/150" />')}>Imagen</button>
          </div>

          {/* Paleta de colores */}
          {modoEditor === 'visual' && (
            <div className="p-2 bg-gray-100 border rounded-xl flex flex-col items-center h-full">
              <button
                onClick={() => setMostrandoEditorPaleta(!mostrandoEditorPaleta)}
                className="m-auto px-3 py-1 bg-[#6ed8bf] text-white rounded hover:bg-[#6ed8bf]"
              >
                {mostrandoEditorPaleta ? 'Ocultar paleta del sitio' : 'Editar paleta del sitio'}
              </button>

              {mostrandoEditorPaleta && (
                <div className="mt-1 grid grid-cols-3 sm:grid-cols-6 gap-1 w-full">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="color"
                      value={paletaUsuario[i] || "#ffffff"}
                      onChange={(e) => {
                        const nueva = [...paletaUsuario];
                        nueva[i] = e.target.value;
                        setPaletaUsuario(nueva);
                      }}
                      className="w-full h-6 border rounded"
                    />
                  ))}
                  <button
                    onClick={async () => {
                      await fetch("/api/admin/settings", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: "paleta_colores",
                          value: JSON.stringify(paletaUsuario),
                        }),
                      });
                      setMostrandoEditorPaleta(false);
                    }}
                    className="col-span-3 sm:col-span-6 mt-2 bg-green-600 text-white py-1 rounded hover:bg-green-700"
                  >
                    Guardar Paleta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logo */}
        {modoEditor === 'visual' && (
          <div className="md:col-span-1 p-2 bg-gray-100 border rounded-xl">
            <p className="mb-1 font-semibold">Logo del sitio:</p>
            <div
              className="w-full aspect-square bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition relative"
              onClick={(e) => {
                // Si el clic vino desde el botón, no hacemos nada
                if (e.target.tagName === "BUTTON") return;

                setImagenSeleccionada('logo');
                setGaleriaAbierta(true);
              }}
            >
              <img
                src={
                  logoURL || ImageNotSupported
                }
                alt="Logo del sitio"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ImageNotSupported;
                }}
              />
              <button
                onClick={async (e) => {
                  e.stopPropagation(); // aún lo mantenemos
                  try {
                    await navigator.clipboard.writeText(logoURL);
                    alert("URL copiada");
                  } catch {
                    alert("Error");
                  }
                }}
                className="absolute bottom-1 right-1 z-10 bg-[#6ed8bf] text-white rounded px-1 py-0.5 text-xs hover:bg-[#6ed8bf]"
              >
                Copiar URL
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Controles de modo/deshacer */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <button className={btnSmall2} onClick={() => setModoEditor(modoEditor === 'visual' ? 'codigo' : 'visual')}>
          {modoEditor === 'visual' ? 'Ver Código' : 'Ver Visual'}
        </button>
        <div className="flex gap-2">
          <button className={btnSmall3} onClick={deshacer} disabled={indiceHistorial <= 0}>Deshacer</button>
          <button className={btnSmall3} onClick={rehacer} disabled={indiceHistorial >= historial.length - 1}>Rehacer</button>
        </div>
      </div>
      {modoEditor === 'visual' && selectedElement && (
        <div className="border p-4 bg-gray-50 rounded">
          <strong>Estilos del elemento seleccionado:</strong>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 mt-2">
            <span><strong>Etiqueta:</strong> {selectedStyles.tag}</span>
            <div className="mb-4 md:col-start-2 col-span-6">
              <div className="flex flex-wrap gap-2 border-b pb-2 mb-2">
                {Object.keys(STYLE_GROUPS).map((grupo) => (
                  <button
                    key={grupo}
                    onClick={() => setTabActivo(grupo)}
                    className={`px-3 py-1 rounded-t text-sm flex items-center gap-1 ${tabActivo === grupo
                      ? 'bg-[#6ed8bf] text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    {STYLE_TAB_ICONS[grupo]}
                    {grupo}
                  </button>
                ))}
              </div>
              <div className="p-3 border rounded bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {STYLE_GROUPS[tabActivo].map((prop) => {
                    const opciones = TAILWIND_MAP[prop];
                    if (!opciones) return null;
                    if (prop === 'paletaSitio') {
                      return (
                        <div key={prop} className="flex flex-col text-sm col-span-full">
                          <p className="font-semibold mb-2">Paleta de Colores del Sitio</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {paletaUsuario.map((color) => (
                              <button
                                key={color}
                                title={color}
                                onClick={() =>
                                  actualizarClaseTailwind(
                                    STYLE_GROUPS.Colores.includes('backgroundColor') ? 'backgroundColor' : 'color',
                                    color
                                  )
                                }
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            <input
                              type="color"
                              onChange={(e) =>
                                actualizarClaseTailwind(
                                  STYLE_GROUPS.Colores.includes('backgroundColor') ? 'backgroundColor' : 'color',
                                  e.target.value
                                )
                              }
                              className="w-6 h-6 p-0 border rounded cursor-pointer"
                              title="Elegir color"
                            />
                          </div>
                        </div>
                      );
                    }

                    if (!tailwindMode &&
                      [
                        'gridTemplateColumns',
                        'gridTemplateRows',
                        'gap',
                        'colStart',
                        'colSpan',
                        'colEnd',
                        'borderColor',
                        'borderRadius',
                        'borderStyle',
                        'backgroundRepeat',
                        'backgroundSize',
                        'backgroundPosition'
                      ].includes(prop)
                    ) {
                      return null;
                    }

                    if (tailwindMode && typeof opciones === 'object' && !Array.isArray(opciones)) {
                      return (
                        <div key={prop} className="col-span-full border rounded p-2 bg-gray-50">
                          <p className="font-semibold mb-2">{prop}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
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

                    if (!tailwindMode && (prop === 'color' || prop === 'backgroundColor')) {
                      return (
                        <label key={prop} className="flex flex-col text-sm">
                          {prop}:
                          <div className="flex flex-col gap-1 mt-1">
                            <input
                              type="text"
                              value={selectedStyles[prop] || ''}
                              onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                              className="border rounded p-1"
                            />
                            <div>
                              <p className="text-xs font-semibold mt-1 mb-1">Paleta</p>
                              <div className="grid grid-cols-6 gap-1">
                                {paletaUsuario.map((color, idx) => (
                                  <button
                                    key={idx}
                                    title={color}
                                    onClick={() => actualizarClaseTailwind(prop, color)}
                                    className="m-auto w-3 h-3 rounded border"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold mt-2 mb-1">Colores por defecto</p>
                              <div className="grid grid-cols-5 gap-1">
                                {PALETA_COLORES.map((color) => (
                                  <button
                                    key={color}
                                    title={color}
                                    onClick={() => actualizarClaseTailwind(prop, color)}
                                    className="m-auto w-3 h-3 rounded border"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    }

                    if (!tailwindMode && prop === 'backgroundImage') {
                      return (
                        <label key={prop} className="flex flex-col text-sm">
                          {prop}:
                          <input
                            type="text"
                            list="bg-image-options"
                            value={selectedStyles[prop] || ''}
                            onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                            className="border rounded p-1 mt-1"
                          />
                          <datalist id="bg-image-options">
                            <option value='url("https://ejemplo.com/imagen1.jpg")' />
                            <option value='url("https://cdn.sitio.com/bg2.png")' />
                            <option value='url("/imagenes/fondo.png")' />
                            <option value='none' />
                          </datalist>
                        </label>
                      );
                    }

                    if (!tailwindMode && prop === 'backgroundPosition') {
                      return (
                        <label key={prop} className="flex flex-col text-sm">
                          {prop}:
                          <input
                            type="text"
                            list="bg-position-options"
                            value={selectedStyles[prop] || ''}
                            onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                            className="border rounded p-1 mt-1"
                          />
                          <datalist id="bg-position-options">
                            <option value="center" />
                            <option value="top" />
                            <option value="bottom" />
                            <option value="left" />
                            <option value="right" />
                            <option value="top left" />
                            <option value="bottom right" />
                          </datalist>
                        </label>
                      );
                    }

                    if (!tailwindMode && prop === 'backgroundSize') {
                      return (
                        <label key={prop} className="flex flex-col text-sm">
                          {prop}:
                          <input
                            type="text"
                            list="bg-size-options"
                            value={selectedStyles[prop] || ''}
                            onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                            className="border rounded p-1 mt-1"
                          />
                          <datalist id="bg-size-options">
                            <option value="auto" />
                            <option value="cover" />
                            <option value="contain" />
                          </datalist>
                        </label>
                      );
                    }

                    if (!tailwindMode && !['color', 'backgroundColor'].includes(prop)) {
                      return (
                        <label key={prop} className="flex flex-col text-sm">
                          {prop}:
                          <input
                            type="text"
                            value={selectedStyles[prop] || ''}
                            onChange={(e) => actualizarClaseTailwind(prop, e.target.value)}
                            className="border rounded p-1 mt-1"
                          />
                        </label>
                      );
                    }

                    if (tailwindMode && Array.isArray(opciones)) {
                      return (
                        <label key={prop} className="flex flex-col text-sm">
                          {prop}:
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
                        </label>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={aplicarEstilosTailwind}
              className="px-4 py-2 bg-[#6ed8bf] text-white rounded hover:bg-[#6ed8bf] transition"
            >
              {tailwindMode ? 'Quitar TailwindCSS' : 'Usar TailwindCSS'}
            </button>
          </div>
        </div>
      )}
      {/* Código o visual */}
      <div className="flex-1">
        {modoEditor === 'codigo' ? (
          <>
            <h3>Editor de código</h3>
            <MonacoEditor
              defaultLanguage="javascript"
              value={content}
              onChange={(val) => {
                if (val !== null) {
                  registrarCambio(val);
                  setContent(val);
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                wrappingIndent: 'same',
                scrollBeyondLastLine: false,
                scrollbar: {
                  vertical: 'hidden', // 👈 oculta barra vertical
                  horizontal: 'auto',
                },
                overviewRulerLanes: 0, // 👈 oculta reglas de colores a la derecha
              }}
              onMount={(editor) => {
                monacoRef.current = editor;

                // 🔄 Ajustar la altura automáticamente según contenido
                const resize = () => {
                  const contentHeight = editor.getContentHeight();
                  editor.layout({ width: editor.getLayoutInfo().width, height: contentHeight });
                };

                // Llamar cuando el contenido cambie
                editor.onDidContentSizeChange(resize);
                resize();
              }}
            />
          </>
        ) : (
          <>
            <h3>Editor visual</h3>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleVisualInput}
              className="border p-4 min-h-[300px] bg-white overflow-hidden"
              spellCheck={false}
            />
          </>
        )}
      </div>
    </>
  )
}