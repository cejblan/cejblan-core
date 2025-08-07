'use client';

import { useEffect, useState } from 'react';

export default function PluginStore() {
  const [plugins, setPlugins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [domain, setDomain] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [slideIndex, setSlideIndex] = useState(0);

  // Installer state
  const [installMode, setInstallMode] = useState(false);
  const [file, setFile] = useState(null);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    if (!installMode) {
      fetch('/api/admin/plugins')
        .then(res => res.json())
        .then(data => setPlugins(data))
        .catch(console.error);
    }
  }, [installMode]);

  // ---- Store handlers ----

  const downloadPlugin = async () => {
    const payload = {
      pluginName: selected.name,
      ruta: selected.ruta,
    };
    if (Number(selected.price) > 0) {
      payload.domain = domain;
    }

    const res = await fetch('/api/admin/plugins/package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Error al descargar plugin:', text);
      return alert('Error al descargar plugin');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.ruta}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sliderImages = selected?.images?.slice(1, 3) || [];

  const nextSlide = () => {
    if (!sliderImages.length) return;
    setSlideIndex(prev => (prev + 1) % sliderImages.length);
  };
  const prevSlide = () => {
    if (!sliderImages.length) return;
    setSlideIndex(prev => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const selectedPrice = selected ? Number(selected.price) || 0 : 0;

  // ---- Installer handlers ----

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setInstallMessage('');
  };

  const handleInstallSubmit = async e => {
    e.preventDefault();
    if (!file) {
      setInstallMessage('Por favor selecciona un archivo ZIP.');
      return;
    }
    const form = new FormData();
    form.append('pluginZip', file);

    setInstallMessage('Subiendo y procesando…');

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
      setInstallMessage(`Plugin instalado en "${json.folder}" correctamente.`);
      // Refresh plugin list after install
      setInstallMode(false);
    } else {
      setInstallMessage(`Fallo instalación: ${json.error}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {installMode ? 'Instalar Plugin' : 'Tienda de Plugins'}
        </h1>
        <button
          onClick={() => {
            setInstallMode(!installMode);
            setSelected(null);
            setShowBuyForm(false);
            setFile(null);
            setInstallMessage('');
          }}
          className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white px-4 py-2 rounded"
        >
          {installMode ? 'Ver Tienda' : 'Instalar desde ZIP'}
        </button>
      </div>

      {installMode ? (
        // ---- Installer UI ----
        <form onSubmit={handleInstallSubmit} className="space-y-4 max-w-xl">
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="block"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Subir e instalar
            </button>
          </div>
          {installMessage && (
            <p className="mt-4 text-sm text-gray-700">{installMessage}</p>
          )}
        </form>
      ) : (
        // ---- Store UI ----
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {plugins.map(p => {
              const price = Number(p.price) || 0;
              return (
                <div
                  key={p.name}
                  className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer"
                  onClick={() => {
                    setSelected(p);
                    setShowBuyForm(false);
                    setSlideIndex(0);
                    setDomain('');
                  }}
                >
                  <div className="w-full aspect-square overflow-hidden">
                    <img
                      src={p.images?.[0] || '/placeholder.png'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">{p.name}</h2>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {p.description}
                    </p>
                    <p className="mt-2 font-bold text-lg">${price}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-black font-bold"
                  onClick={() => setSelected(null)}
                >
                  ✕
                </button>
                <div className="p-6 space-y-2">
                  <div className="flex">
                    <img
                      src={selected.images?.[0] || '/placeholder.png'}
                      alt={selected.longName}
                      className="bg-slate-100 border-[1px] border-solid border-slate-300 rounded-full w-9 h-9 object-cover"
                    />
                    <div className="text-left pl-2 block">
                      <h2 className="text-3xl font-bold text-slate-800">
                        {selected.longName}
                      </h2>
                      <h2 className="text-lg font-bold text-slate-600">
                        Desarrollador: {selected.developer}
                      </h2>
                    </div>
                  </div>

                  <div className="relative w-full aspect-square overflow-hidden">
                    <img
                      src={sliderImages[slideIndex] || '/placeholder.png'}
                      alt={`${selected.name} slider ${slideIndex + 2}`}
                      className="w-full h-full object-cover rounded"
                    />
                    {sliderImages.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                        >
                          ‹
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  <p className="text-gray-700">{selected.description}</p>
                  <div className="flex items-center">
                    <p className="text-3xl font-bold text-slate-800 ml-auto mr-4">
                      ${selectedPrice}
                    </p>
                    {selectedPrice === 0 ? (
                      <button
                        className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white px-5 py-2 rounded mr-auto"
                        onClick={downloadPlugin}
                      >
                        Descargar Gratis
                      </button>
                    ) : !showBuyForm ? (
                      <button
                        className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white py-1 px-2 rounded-xl mr-auto"
                        onClick={() => setShowBuyForm(true)}
                      >
                        Comprar
                      </button>
                    ) : (
                      <form className="space-y-4 mr-auto">
                        <div>
                          <label className="block font-medium">
                            Forma de pago
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="w-full p-2 border rounded"
                          >
                            <option value="credit_card">
                              Tarjeta de crédito
                            </option>
                            <option value="paypal">PayPal</option>
                            <option value="bank_transfer">
                              Transferencia bancaria
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-medium">
                            Dominio donde se usará
                          </label>
                          <input
                            type="text"
                            value={domain}
                            onChange={e => setDomain(e.target.value)}
                            placeholder="midominio.com"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <button
                          type="button"
                          className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white px-5 py-2 rounded w-full"
                          onClick={downloadPlugin}
                        >
                          Confirmar compra
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
