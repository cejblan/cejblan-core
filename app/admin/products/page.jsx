"use client"

import { useState, useEffect } from "react";
import Titulos from "@/components/editable/Titulos";
import { LoadProducts } from "../components/LoadProducts";
import ProductCardAdmin from "../components/ProductCardAdmin";

export default function ProductsPageAdmin() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const itemsPerPage = 9; // Número de productos por página
  // Cálculo de los índices para la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  // Controladores de navegación
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (endIndex < products.length) setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    LoadProducts(setProducts);
  }, [setProducts]);

  return (
    <>
      <Titulos texto="Lista de Productos" />
      <div className="grid max-[420px]:grid-cols-1 grid-cols-4 gap-1 justify-center items-center pb-4">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCardAdmin product={product} key={product.id} />
          ))
        ) : (
          <div className="text-center col-start-1 max-[420px]:col-end-2 col-end-5 mx-auto">
            <p className="bg-white text-xl py-1 px-2 rounded-xl mx-auto">No hay productos disponibles...</p>
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
          disabled={endIndex >= products.length}
          className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <p className="text-center font-bold mt-1 mx-auto w-fit">
        Página {currentPage} de {Math.ceil(products.length / itemsPerPage)}
      </p>
    </>
  );
}