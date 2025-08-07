'use client';

import { useEffect, useState } from 'react';

export default function PluginStore() {
  const [plugins, setPlugins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [domain, setDomain] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    fetch('/api/admin/plugins')
      .then(res => res.json())
      .then(data => setPlugins(data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tienda de Plugins</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((p) => (
          <div
            key={p.name}
            className="border rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer"
            onClick={() => { setSelected(p); setShowBuyForm(false); }}
          >
            <img
              src={p.images?.[0] || '/placeholder.png'}
              alt={p.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
              <p className="mt-2 font-bold text-lg">${p.price}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{selected.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <img
                  src={selected.images?.[0] || '/placeholder.png'}
                  alt={`${selected.name} 1`}
                  className="w-full h-48 object-cover rounded"
                />
                <img
                  src={selected.images?.[1] || selected.images?.[0] || '/placeholder.png'}
                  alt={`${selected.name} 2`}
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              <p className="text-gray-700">{selected.description}</p>
              <p className="font-bold text-xl">${selected.price}</p>

              {!showBuyForm ? (
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
                    onClick={() => alert(`Comprando ${selected.name} para ${domain} con ${paymentMethod}`)}
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
