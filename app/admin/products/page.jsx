"use client"

import { useState, useEffect } from "react";
import Titulos from "@/components/editable/Titulos";
import { LoadProducts } from "../components/LoadProducts";
import ProductCardAdmin from "../components/ProductCardAdmin";
import SearchProduct from "@/app/admin/components/SearchProduct";

export default function ProductsPageAdmin() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const handleProductSelect = (product) => {
    setSearchQuery(product.name);
    setCurrentPage(1);
  };

  useEffect(() => {
    LoadProducts(setProducts);
  }, []);

  const productosFiltrados = products.filter((p) =>
    searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = productosFiltrados.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (endIndex < productosFiltrados.length) setCurrentPage((prev) => prev + 1);
  };

  return (
    <>
      <Titulos texto="Lista de Productos" />

      <div className="max-w-md mx-auto pb-4">
        <SearchProduct
          onSelectProduct={handleProductSelect}
          onSearchQueryChange={(value) => setSearchQuery(value)}
        />
      </div>

      <div className="grid max-[420px]:grid-cols-1 grid-cols-4 gap-1 justify-center items-center pb-4">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCardAdmin product={product} key={product.id || product._id || product.name} />
          ))
        ) : (
          <div className="text-center col-start-1 max-[420px]:col-end-2 col-end-5 mx-auto">
            <p className="bg-white text-xl py-1 px-2 rounded-xl mx-auto">
              No hay productos disponibles...
            </p>
          </div>
        )}
      </div>

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
          disabled={endIndex >= productosFiltrados.length}
          className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      <p className="text-center font-bold mt-1 mx-auto w-fit">
        Página {currentPage} de {Math.ceil(productosFiltrados.length / itemsPerPage)}
      </p>
    </>
  );
}