"use client";

import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    setMessage(false);
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(value)}`);
      const results = await response.json();
      setSuggestions(results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const OnClick = async () => {
    if (!message) {
      setMessage(true);
    } else if (message) {
      setMessage(false);
    }
  }

  return (
    <div className="max-[420px]:text-sm text-base text-slate-800 text-left mr-1 max-[420px]:w-2/3 w-full max-[420px]:absolute relative max-[420px]:top-10 max-[420px]:right-0">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Buscar productos..."
        className="w-full px-2 py-1 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {loading &&
        <div className="absolute top-6 w-full bg-white border border-slate-300 rounded-lg shadow-lg z-50">
          <p className="hover:bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">Cargando...</p>
        </div>
      }
      {suggestions.length > 0 && (
        <div className="absolute top-6 w-full bg-white border border-slate-300 rounded-lg shadow-lg z-50">
          {
            message &&
            <p
              className="bg-blue-300 text-slate-800 px-2 py-1 rounded-lg cursor-pointer"
              onClick={OnClick}
            >
              Inicia session para ver el producto 😉
            </p>
          }
          {suggestions.map((product, index) => (
            <p
              key={index}
              className="hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg cursor-pointer"
              onClick={OnClick}
            >
              {product.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}