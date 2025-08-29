"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import Image from "next/image";
import ImageNotSupported from "public/ImageNotSupported.webp";
import { LoadProducts } from "@/app/admin/components/LoadProducts";
import ProductCard from "@/components/editable/ProductCard";

export default function ProductsComponent() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const itemsPerPage = 9; // Número de productos por página

  // buscador y filtros (tomados de la apariencia del segundo código)
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // referencias por si se necesita scroll/salto
  const todosRef = useRef(null);

  // Carga de productos (mantenemos la lógica de carga del primer código)
  useEffect(() => {
    LoadProducts(setProducts);
  }, []);

  // Resetea la página actual cuando cambian filtros/búsqueda o lista
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, products.length]);

  // Función auxiliar para convertir installs a número (copiada por seguridad de la segunda apariencia)
  const parseInstalls = (raw) => {
    if (!raw && raw !== 0) return 0;
    if (typeof raw === "number") return raw;
    try {
      const digits = String(raw).replace(/[^\d]/g, "");
      return digits ? parseInt(digits, 10) : 0;
    } catch {
      return 0;
    }
  };

  // lógica de búsqueda (similar al segundo código)
  const searchedProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const dev = (p.developer || "").toLowerCase();
      const tags = (Array.isArray(p.tags) ? p.tags.join(" ") : (p.tags || "")).toLowerCase();
      return name.includes(q) || desc.includes(q) || dev.includes(q) || tags.includes(q);
    });
  }, [products, searchQuery]);

  // lógica de filtrado (free / paid / all)
  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return searchedProducts;
    if (activeFilter === "free") return searchedProducts.filter((p) => Number(p.price) === 0);
    return searchedProducts.filter((p) => Number(p.price) > 0);
  }, [searchedProducts, activeFilter]);

  // Paginación basada en filteredProducts (mantenemos la forma de cómo carga los items del primer código)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Controladores de navegación
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // small helper para scroll suave hacia el listado (tomado de la segunda apariencia)
  const scrollToTodos = () => {
    const target = todosRef.current;
    if (!target) return window.scrollTo({ top: 0, behavior: "smooth" });
    const startY = window.scrollY || window.pageYOffset;
    const rect = target.getBoundingClientRect();
    const targetY = startY + rect.top;
    const duration = 700;
    const startTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const currentY = startY + (targetY - startY) * eased;
      window.scrollTo(0, currentY);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    // ===START_RETURN===
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header + acciones */}
      <div className="flex flex-wrap items-center gap-3 justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Lista de Productos</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // recargar usando la misma función de carga
              LoadProducts(setProducts);
              scrollToTodos();
            }}
            className="bg-white hover:bg-gray-200 rounded-lg border border-slate-200 px-3 py-2 text-sm transition"
            title="Recargar lista de productos"
          >
            Recargar
          </button>
        </div>
      </div>

      <p className="text-slate-600 mb-4">Busca por nombre o descripción. Usa los filtros para refinar.</p>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos (ej. lavadora, teclado, harina, etc.)"
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-10 outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Buscar productos"
          />
          <PiMagnifyingGlassBold className="absolute left-3 top-2 select-none w-4 h-4 text-slate-500" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-lg absolute right-3 top-2 select-none" aria-label="Limpiar búsqueda">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full border ${activeFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50 border-slate-300"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter("free")}
            className={`px-3 py-1.5 rounded-full border ${activeFilter === "free" ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50 border-slate-300"}`}
          >
            Gratuitos
          </button>
          <button
            onClick={() => setActiveFilter("paid")}
            className={`px-3 py-1.5 rounded-full border ${activeFilter === "paid" ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50 border-slate-300"}`}
          >
            Pagos
          </button>
        </div>
      </div>

      {/* Populares section (ahora usando ProductCard) */}
      <SectionHeader title="Populares" actionLabel="Ver todos" onAction={scrollToTodos} />
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredProducts.slice(0, 3).map((p) => (
            <ProductCard product={p} key={p.id || p.name} />
          ))}
        </div>
      </div>

      {/* Todos (paginados) */}
      <div ref={todosRef} className="mt-10">
        <SectionHeader title={`Todos (${filteredProducts.length})`} />
        <div className="mt-4 grid max-[420px]:grid-cols-1 grid-cols-3 gap-4 justify-center items-start pb-4 px-3">
          {currentProducts.length > 0 ? (
            // Aquí usamos ProductCard para cada producto (manteniendo la lógica de carga original)
            currentProducts.map((product) => (
              <ProductCard product={product} key={product.id || product.name} />
            ))
          ) : (
            <div className="text-center col-start-1 max-[420px]:col-end-2 col-end-5 mx-auto">
              <p className="bg-white text-xl py-1 px-2 rounded-xl mx-auto">No hay productos disponibles...</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        <p className="text-slate-900 text-center font-bold pb-2 mt-1 mx-auto w-fit">
          Página {currentPage} de {totalPages}
        </p>
      </div>
    </div>
    // ===END_RETURN===
  );
}

/* ===== Presentational components ===== */

function SectionHeader({ title, className = "", actionLabel = "Ver todos", onAction }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {typeof onAction === "function" ? (
        <button className="text-sm font-medium text-slate-700 hover:text-slate-900" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
