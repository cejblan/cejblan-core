'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PiMagnifyingGlassBold } from 'react-icons/pi';

/**
 * Cliente: lee plugins desde la tienda oficial y redirige a la tienda
 * para comprar/descargar. Incluye opción local para instalar ZIP.
 *
 * Configuración:
 * - NEXT_PUBLIC_STORE_URL (opcional): base URL de la tienda oficial,
 *   p. ej. https://tienda.ejemplo.com
 */

const STORE_BASE = 'https://cejblan.vercel.app';

export default function PluginStore() {
  const [plugins, setPlugins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [domain, setDomain] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [slideIndex, setSlideIndex] = useState(0);

  // Instalador (presente en la versión cliente)
  const [installMode, setInstallMode] = useState(false);
  const [file, setFile] = useState(null);
  const [installMessage, setInstallMessage] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // loading y control de recarga
  const [loading, setLoading] = useState(false);

  // Buscador
  const [searchQuery, setSearchQuery] = useState('');

  // ref para la sección "Todos" (scroll target)
  const todosRef = useRef(null);

  // visibleCount para paginación "Ver más" en TODOS
  const [visibleCount, setVisibleCount] = useState(12);

  // filtro: 'all' | 'free' | 'paid'
  const [activeFilter, setActiveFilter] = useState('all');

  // --- Load plugins desde la tienda oficial ---
  const loadPlugins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${STORE_BASE}/api/plugins`);
      if (!res.ok) {
        console.error('Fallo al obtener plugins desde tienda oficial', res.statusText);
        setPlugins([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPlugins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetch plugins (tienda oficial):', err);
      setPlugins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  // Reset visibleCount cuando cambia la búsqueda, el filtro o cambian los plugins
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, plugins.length, activeFilter]);

  // ---- Utilidades ----
  const parseInstalls = (raw) => {
    if (!raw && raw !== 0) return 0;
    if (typeof raw === 'number') return raw;
    try {
      const digits = String(raw).replace(/[^\d]/g, '');
      return digits ? parseInt(digits, 10) : 0;
    } catch {
      return 0;
    }
  };

  // Determina la URL pública del plugin en la tienda oficial
  const getPluginStoreUrl = (p) => {
    if (!p) return STORE_BASE;
    // Intenta campos comunes primero
    const candidates = ['storeUrl', 'store_url', 'url', 'link', 'storeLink', 'store_link'];
    for (const k of candidates) {
      if (p[k]) return p[k];
    }
    // Si viene una ruta/slug usa eso, si no, usa el nombre codificado
    const slug = p.rute || p.slug || (p.name && p.name.toLowerCase().replace(/\s+/g, '-'));
    return `${STORE_BASE}/plugins/${encodeURIComponent(slug || p.name || '')}`;
  };

  // ---- Búsqueda cliente (filtrado por texto) ----
  const searchedPlugins = useMemo(() => {
    if (!searchQuery) return plugins;
    const q = searchQuery.trim().toLowerCase();
    return plugins.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const dev = (p.developer || '').toLowerCase();
      const tags = (p.tags || []).join(' ').toLowerCase();
      return name.includes(q) || desc.includes(q) || dev.includes(q) || tags.includes(q);
    });
  }, [plugins, searchQuery]);

  // ---- Aplicar filtro (Todos / Gratuitos / Pagos) ----
  const filteredPlugins = useMemo(() => {
    if (activeFilter === 'all') return searchedPlugins;
    if (activeFilter === 'free') {
      return searchedPlugins.filter((p) => {
        const price = Number(p.price) || 0;
        return price === 0;
      });
    }
    // paid
    return searchedPlugins.filter((p) => {
      const price = Number(p.price) || 0;
      return price > 0;
    });
  }, [searchedPlugins, activeFilter]);

  // ---- Populares: ordenamos y tomamos top 3 ----
  const populares = useMemo(() => {
    return [...filteredPlugins]
      .sort((a, b) => parseInstalls(b.activeInstalls) - parseInstalls(a.activeInstalls))
      .slice(0, 3);
  }, [filteredPlugins]);

  // Todos y visibleTodos
  const todos = filteredPlugins;
  const visibleTodos = todos.slice(0, visibleCount);

  // ---- Scroll suave "medio-lento" hacia todos ----
  const scrollToTodos = () => {
    const target = todosRef.current;
    if (!target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const startY = window.scrollY || window.pageYOffset;
    const rect = target.getBoundingClientRect();
    const targetY = startY + rect.top;
    const duration = 700; // ms
    const startTime = performance.now();

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const currentY = startY + (targetY - startY) * eased;
      window.scrollTo(0, currentY);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  // "Ver más" incrementa visibleCount en 12 (hasta el total)
  const handleVerMas = () => {
    setVisibleCount((prev) => Math.min(prev + 12, todos.length));
  };

  // ---- ACCIONES DE COMPRA/DESCARGA (cliente) ----
  // En la versión cliente abrimos la página del plugin en la tienda oficial
  const openPluginInStore = (p, opts = {}) => {
    const url = getPluginStoreUrl(p);
    // Si queremos incluir query params (por ejemplo método de pago), se pueden añadir:
    const urlObj = new URL(url, STORE_BASE);
    if (opts.method) urlObj.searchParams.set('paymentMethod', opts.method);
    // Abrir en nueva pestaña
    window.open(urlObj.toString(), '_blank');
    // cerramos el modal local si está abierto
    setSelected(null);
    setShowBuyForm(false);
    // No mostramos modales locales de compra/transferencia
  };

  // ---- Instalador (presente en cliente) ----
  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setInstallMessage('');
  };

  const handleInstallSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setInstallMessage('Por favor selecciona un archivo ZIP.');
      return;
    }
    const form = new FormData();
    form.append('pluginZip', file);

    setInstallMessage('Subiendo y procesando…');

    try {
      const res = await fetch('/api/admin/plugins/upload', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const error = await res.text();
        setInstallMessage(`Error: ${error}`);
        return;
      }

      const json = await res.json();
      if (json.success) {
        setSuccessMessage(`Plugin instalado correctamente en "${json.folder || 'destino'}".`);
        setShowSuccessModal(true);
        setInstallMode(false);
        setFile(null);
        setInstallMessage('');
        // recargar lista (intenta traer cambios si aplica)
        loadPlugins();
      } else {
        setInstallMessage(`Fallo instalación: ${json.error || 'desconocido'}`);
      }
    } catch (err) {
      setInstallMessage(`Error: ${String(err)}`);
    }
  };

  // ---- Detalle / modal (al seleccionar plugin) ----
  const selectedPrice = selected ? Number(selected.price) || 0 : 0;
  const sliderImages = selected?.images?.slice(1, 3) || [];
  const nextSlide = () => {
    if (!sliderImages.length) return;
    setSlideIndex((prev) => (prev + 1) % sliderImages.length);
  };
  const prevSlide = () => {
    if (!sliderImages.length) return;
    setSlideIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  // título dinámico para la sección "Todos" según filtro
  const todosTitle =
    activeFilter === 'all' ? `Todos (${todos.length})` : activeFilter === 'free' ? `Gratuitos (${todos.length})` : `Pagos (${todos.length})`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado superior */}
      <div className="flex flex-wrap items-center gap-3 justify-between mb-6">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Plugins</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPlugins()}
            className="bg-white hover:bg-gray-200 rounded-lg border border-slate-200 px-3 py-2 text-sm transition"
            title="Recargar lista de plugins"
          >
            Recargar
          </button>

          {/* Botón instalador (presente en cliente) */}
          <button
            onClick={() => {
              setInstallMode((v) => !v);
              setSelected(null);
              setShowBuyForm(false);
              setInstallMessage('');
              setFile(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6ed8bf] px-4 py-2 text-white hover:bg-[#4bb199] transition"
          >
            {installMode ? 'Ver Tienda' : 'Instalar desde ZIP'}
          </button>
        </div>
      </div>

      {/* Instalador UI */}
      {installMode ? (
        <form onSubmit={handleInstallSubmit} className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 mx-auto">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Instalar plugin</h2>
          <p className="text-slate-600 mb-4">
            Sube el archivo <span className="font-medium">.zip</span> de tu plugin para instalarlo en este sitio.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input type="file" accept=".zip" onChange={handleFileChange} className="block" />
            <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition">
              Subir e instalar
            </button>
          </div>
          {installMessage && <p className="mt-4 text-sm text-slate-700">{installMessage}</p>}
        </form>
      ) : null}

      {/* Subtítulo y barra de búsqueda funcional */}
      <p className="text-slate-600 mb-4">¡Extiende tu experiencia! Busca por nombre, descripción o autor.</p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar plugins (ej. formulario, SEO, analytics, autor)"
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-10 outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Buscar plugins"
          />
          <PiMagnifyingGlassBold className="absolute left-3 top-2 select-none w-4 h-4 text-slate-500" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-lg absolute right-3 top-2 select-none" aria-label="Limpiar búsqueda">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full border ${activeFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-300'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter('free')}
            className={`px-3 py-1.5 rounded-full border ${activeFilter === 'free' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-300'}`}
          >
            Gratuitos
          </button>
          <button
            onClick={() => setActiveFilter('paid')}
            className={`px-3 py-1.5 rounded-full border ${activeFilter === 'paid' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-300'}`}
          >
            Pagos
          </button>
        </div>
      </div>

      {/* POPULARES */}
      <SectionHeader title="Populares" actionLabel="Ver todos" onAction={scrollToTodos} />
      <PluginList
        plugins={populares}
        loading={loading}
        onSelect={(p) => {
          setSelected(p);
          setShowBuyForm(false);
          setSlideIndex(0);
          setDomain('');
        }}
      />

      {/* TODOS */}
      <div ref={todosRef} className="mt-10">
        <SectionHeader title={todosTitle} actionLabel="Ver más" onAction={handleVerMas} />
        <PluginList
          plugins={visibleTodos}
          loading={loading}
          onSelect={(p) => {
            setSelected(p);
            setShowBuyForm(false);
            setSlideIndex(0);
            setDomain('');
          }}
        />

        {/* Botón "Ver más" adicional */}
        {visibleCount < todos.length && (
          <div className="mt-4 flex justify-center">
            <button onClick={handleVerMas} className="rounded-lg bg-white border border-slate-300 px-4 py-2 hover:shadow-sm transition">
              Ver más
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-3 right-3 text-slate-500 hover:text-black font-bold" onClick={() => setSelected(null)}>
              ✕
            </button>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <img src={selected.images?.[0] || '/placeholder.png'} alt={selected.longName || selected.name} className="w-14 h-14 rounded-lg border border-slate-200 object-cover bg-slate-50" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selected.longName || selected.name}</h2>
                  <p className="text-sm text-slate-600">
                    Desarrollador: <span className="font-medium">{selected.developer || '—'}</span>
                  </p>
                </div>
              </div>

              <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img src={sliderImages[slideIndex] || '/placeholder.png'} alt={`${selected.name} slider ${slideIndex + 2}`} className="w-full h-full object-cover" />
                {sliderImages.length > 1 && (
                  <>
                    <button onClick={prevSlide} className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-full">
                      ‹
                    </button>
                    <button onClick={nextSlide} className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-full">
                      ›
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-slate-700">{selected.description}</p>

                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-3xl font-bold text-slate-900 ml-0">${selectedPrice}</p>

                  {/* En el cliente, al pulsar descargar/comprar abrimos la tienda en otra pestaña */}
                  {selectedPrice === 0 ? (
                    <a
                      href="https://cejblan.vercel.app/cejblan-core/store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#6ed8bf] px-5 py-2 text-white hover:bg-[#4bb199] transition"
                    >
                      Ver en tienda
                    </a>
                  ) : !showBuyForm ? (
                    <a
                      href="https://cejblan.vercel.app/cejblan-core/store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#6ed8bf] px-5 py-2 text-white hover:bg-[#4bb199] transition"
                    >
                      Ver en tienda
                    </a>
                  ) : (
                    // Si se llegara a usar showBuyForm, el confirmar también abriría la tienda
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" onSubmit={(e) => { e.preventDefault(); openPluginInStore(selected, { method: paymentMethod }); }}>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Forma de pago</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-md border border-slate-300 p-2">
                          <option value="credit_card">Tarjeta de crédito</option>
                          <option value="paypal">PayPal</option>
                          <option value="bank_transfer">Transferencia bancaria</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dominio donde se usará</label>
                        <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="midominio.com" className="w-full rounded-md border border-slate-300 p-2" />
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <button type="submit" className="w-full rounded-lg bg-[#6ed8bf] px-5 py-2 text-white hover:bg-[#4bb199] transition">
                          {paymentMethod === 'bank_transfer' ? 'Ir a tienda (transferencia)' : 'Ir a tienda (confirmar)'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO PARA INSTALADOR */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-3">¡Éxito!</h2>
            <p className="text-slate-700 mb-6">{successMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="rounded-lg bg-[#6ed8bf] px-4 py-2 text-white hover:bg-[#4bb199] transition">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Componentes de Presentación (solo UI) ===== */

function SectionHeader({ title, className = '', actionLabel = 'Ver todos', onAction }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {typeof onAction === 'function' ? (
        <button className="text-sm font-medium text-slate-700 hover:text-slate-900" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function PluginList({ plugins, loading, onSelect }) {
  // Cuando está cargando mostramos esqueletos
  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-200 shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/5 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Si ya cargó pero no hay plugins
  if (!plugins || plugins.length === 0) {
    return (
      <div className="mt-4 bg-white border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-700 mb-4">No se encontraron plugins.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              fetch(`${STORE_BASE}/api/plugins`)
                .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
                .then((data) => {
                  // Intenta disparar callback global si existe (fallback)
                  if (window.__pluginReloadCallback) window.__pluginReloadCallback(data);
                })
                .catch(() => {
                  window.location.reload();
                });
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50"
          >
            Recargar plugins
          </button>
          <button onClick={() => window.location.reload()} className="rounded-lg px-4 py-2 bg-[#f5f5f5] border border-slate-200 hover:bg-[#efefef]">
            Forzar recarga
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">Si la tienda devuelve plugins, pulsa "Recargar".</p>
      </div>
    );
  }

  // Lista normal
  return (
    <div className="mt-4 grid grid-cols-1 gap-4">
      {plugins.map((p) => {
        const price = Number(p.price) || 0;
        return (
          <button key={p.name} onClick={() => onSelect(p)} className="w-full text-left bg-white border border-slate-200 rounded-xl hover:shadow-md transition focus:outline-none">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 truncate">{p.name}</h3>
                  <span className="text-sm font-medium text-slate-900">${price}</span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>★★★★★</span>
                  <span>·</span>
                  <span>{p.developer || 'Autor desconocido'}</span>
                  <span>·</span>
                  <span>{p.activeInstalls || '—'} instalaciones activas</span>
                </div>

                <p className="mt-2 text-slate-700 line-clamp-2">{p.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ===== Callback global para el botón "Recargar" cuando está vacío ===== */
(function bindGlobalReload() {
  if (typeof window !== 'undefined' && !window.__pluginReloadCallback) {
    window.__pluginReloadCallback = function () {
      try {
        window.location.reload();
      } catch (e) {
        window.location.reload();
      }
    };
  }
})();
