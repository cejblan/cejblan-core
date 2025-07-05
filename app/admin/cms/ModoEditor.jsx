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
  logoURL,
  setLogoURL,
  mostrandoEditorPaleta,
  setMostrandoEditorPaleta,
  imagenSeleccionada,
  setImagenSeleccionada,
  editorRef,
  setContent
}) {
  return (
    <>
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
            >
              {tailwindMode ? 'Quitar TailwindCSS' : 'Usar TailwindCSS'}
            </button>
          </div>
        </div>
      )}

      {modoEditor === 'visual' && (
        <div className="p-4 bg-gray-100 border rounded">
          <p className="mb-2 font-semibold">Logo del sitio:</p>

          <label className="inline-block cursor-pointer">
            <div className="w-32 h-32 bg-white border border-dashed rounded flex items-center justify-center overflow-hidden hover:shadow transition">
              <img
                src={logoURL || "https://9mtfxauv5xssy4w3.public.blob.vercel-storage.com/ImageNotSupported.webp"}
                alt="Logo del sitio"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://9mtfxauv5xssy4w3.public.blob.vercel-storage.com/ImageNotSupported.webp"; // ruta local para imagen rota
                }}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
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
                    setLogoURL(data.secure_url);
                    await fetch("/api/admin/settings", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: "logo_sitio",
                        value: data.secure_url,
                      })
                    });
                  }
                } catch (err) {
                  console.error("Error al subir logo:", err);
                }
              }}
            />
          </label>
        </div>
      )}

      {modoEditor === 'visual' && (
        <div className="p-4 bg-gray-100 border rounded">
          <button
            onClick={() => setMostrandoEditorPaleta(!mostrandoEditorPaleta)}
            className="mb-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {mostrandoEditorPaleta ? 'Ocultar paleta del sitio' : 'Editar paleta del sitio'}
          </button>

          {mostrandoEditorPaleta && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                  className="w-full h-10 border rounded"
                />
              ))}
              <button
                onClick={async () => {
                  await fetch("/api/admin/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: "paleta_colores",
                      value: JSON.stringify(paletaUsuario), // convertir arreglo a string si es necesario
                    })
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
    </>
  )
}