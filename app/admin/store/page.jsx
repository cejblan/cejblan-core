'use client';

import { useEffect, useState } from 'react';

export default function PluginStore() {
  const [plugins, setPlugins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [domain, setDomain] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    fetch('/api/admin/plugins')
      .then(res => res.json())
      .then(data => setPlugins(data))
      .catch(console.error);
  }, []);

  const downloadPlugin = async () => {
    const res = await fetch('/api/admin/plugins/package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginName: selected.name, domain: domain || '' })
    });
    if (!res.ok) return alert('Error al descargar plugin');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Slider images for modal (only images 2 and 3)
  const sliderImages = selected?.images?.slice(1, 3) || [];

  const nextSlide = () => {
    if (!sliderImages.length) return;
    setSlideIndex(prev => (prev + 1) % sliderImages.length);
  };
  const prevSlide = () => {
    if (!sliderImages.length) return;
    setSlideIndex(prev => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  // Compute price values
  const selectedPrice = selected ? (Number(selected.price) || 0) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tienda de Plugins</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map(p => {
          const price = Number(p.price) || 0;
          return (
            <div
              key={p.name}
              className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer"
              onClick={() => { setSelected(p); setShowBuyForm(false); setSlideIndex(0); setDomain(''); }}
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
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
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
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{selected.name}</h2>

              {/* Slider de imágenes 2 y 3 */}
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
              <p className="font-bold text-xl">${selectedPrice}</p>

              {selectedPrice === 0 ? (
                <button
                  className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={downloadPlugin}
                >
                  Descargar Gratis
                </button>
              ) : !showBuyForm ? (
                <button
                  className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setShowBuyForm(true)}
                >
                  Comprar
                </button>
              ) : (
                <form className="mt-4 space-y-4">
                  <div>
                    <label className="block font-medium">Forma de pago</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="credit_card">Tarjeta de crédito</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank_transfer">Transferencia bancaria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium">Dominio donde se usará</label>
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
                    className="w-full px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={downloadPlugin}
                  >
                    Confirmar compra
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
