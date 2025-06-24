'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";
import ProductCard from "@/app/components/ProductCard";

export default function WishlistComponent() {
  const { data: session } = useSession();
  const products = session?.user?.wishlist ?? [];
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (endIndex < products.length) setCurrentPage(prev => prev + 1);
  };

  return (
    <>
      <div className="grid max-[420px]:grid-cols-1 grid-cols-3 gap-2 justify-center items-start pb-4 px-3">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
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
      <p className="text-white text-center font-bold mt-1 mx-auto w-fit">
        Página {currentPage} de {Math.ceil(products.length / itemsPerPage)}
      </p>
    </>
  );
}