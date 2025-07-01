'use client';
import { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import Titulos from "@/components/Titulos";

export default function Coins() {
  const [coins, setCoins] = useState([]);
  const [nuevaTasa, setNuevaTasa] = useState({
    moneda: 'USD',
    valor: '',
  });

  const form = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(`/api/admin/coins`);
        const data = await response.json();
        // Asegura que lo que pasas a setCoins sea un array
        setCoins(Array.isArray(data) ? data : data.monedas || data.tasas || []);
      } catch (error) {
        console.error("Error al cargar tasas:", error);
        setCoins([]);
      }
    };

    fetchCoins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("moneda", nuevaTasa.moneda);
    formData.append("valor", nuevaTasa.valor);

    try {
      const res = await fetch("/api/admin/coins", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      alert("Tasa registrada/actualizada");
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Error al registrar/actualizar tasa:", err);
      alert("Error al guardar la tasa");
    }
  };

  return (
    <>
      <Titulos texto="Tasas de Cambio" />
      <div className="flex gap-2 content-center items-center">
        {Array.isArray(coins) && coins.length > 0 ? (
          coins.map((coin) => (
            <div key={coin.id} className="mb-4 mx-auto block">
              <div className="flex gap-2 items-center">
                <p className="text-2xl font-bold">{coin.moneda}:</p>
                <label
                  readOnly
                  className="bg-white text-xl py-1 px-2 border border-gray-400 rounded-xl"
                >
                  {coin.valor}
                </label>
                <span className="text-xl max-[420px]:text-sm font-bold">
                  {moment(coin.fecha).subtract(4, "hours").format("DD/MM/YYYY")}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-2xl mb-4 mx-auto">No hay tasas registradas</p>
        )}
      </div>
      <div className="grid gap-6 max-w-xl mx-auto">
        <form
          ref={form}
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 border p-4 rounded bg-gray-50"
        >
          <h2 className="text-xl font-semibold">Registrar nueva tasa</h2>
          <select
            className="p-2 border rounded"
            value={nuevaTasa.moneda}
            onChange={(e) => setNuevaTasa({ ...nuevaTasa, moneda: e.target.value })}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Valor"
            className="p-2 border rounded"
            value={nuevaTasa.valor}
            onChange={(e) => setNuevaTasa({ ...nuevaTasa, valor: e.target.value })} />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
          >
            Registrar
          </button>
        </form>
      </div>
    </>
  );
}
