'use client';

import { useEffect, useState } from 'react';
import Titulos from '@/components/Titulos';

export default function Coins() {
  const [tasas, setTasas] = useState({ USD: '', EUR: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bcv')
      .then(res => res.json())
      .then(data => {
        setTasas({
          USD: data.tasas?.USD ?? 'N/A',
          EUR: data.tasas?.EUR ?? 'N/A',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener tasas:', err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Titulos texto="Monedas (BCV)" />
      {loading ? (
        <p className="text-center text-xl mt-4">Cargando tasas...</p>
      ) : (
        <div className="gap-4 grid">
          <div className="justify-center content-center flex gap-2">
            <p className="bg-slate-300 text-3xl p-1 border border-gray-400 block">
              <strong className="text-5xl">$</strong> BCV:
            </p>
            <input
              className="text-3xl p-1 border border-gray-400 block"
              type="text"
              readOnly
              value={tasas.USD}
            />
          </div>
          <div className="justify-center content-center flex gap-2">
            <p className="bg-slate-300 text-3xl p-1 border border-gray-400 block">
              <strong className="text-5xl">€</strong> BCV:
            </p>
            <input
              className="text-3xl p-1 border border-gray-400 block"
              type="text"
              readOnly
              value={tasas.EUR}
            />
          </div>
        </div>
      )}
    </>
  );
}
