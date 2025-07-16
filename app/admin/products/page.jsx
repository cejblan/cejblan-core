"use client"

import { useState, useEffect } from "react"
import Titulos from "@/components/editable/Titulos"
import { LoadProducts } from "../components/LoadProducts"
import ProductCardAdmin from "../components/ProductCardAdmin"
import SearchProduct from "@/app/admin/components/SearchProduct"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/app/admin/components/ui/dialog"
import { Button } from "@/app/admin/components/ui/button"
import PrecioProducto from "@/components/editable/PrecioProducto"
import Image from "next/image";
import ImageNotSupported from "@/public/ImageNotSupported.webp";
import { useRef } from "react";

export default function ProductsPageAdmin() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [showBs, setShowBs] = useState(false)
  const [format, setFormat] = useState("tabla") // tabla | cuadricula
  const [configOpen, setConfigOpen] = useState(false);
  const itemsPerPage = 12
  const dialogRef = useRef(null);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    LoadProducts(setProducts)
  }, [])

  useEffect(() => {
    if (configOpen && dialogRef.current) {
      dialogRef.current.style.overflow = "hidden";
    } else if (dialogRef.current) {
      dialogRef.current.style.overflow = "auto";
    }

    return () => {
      if (dialogRef.current) dialogRef.current.style.overflow = "auto";
    };
  }, [configOpen]);

  const handleProductSelect = (product) => {
    setSearchQuery(product.name)
    setCurrentPage(1)
  }

  const productosFiltrados = products.filter((p) =>
    searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  )

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = productosFiltrados.slice(startIndex, endIndex)

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (endIndex < productosFiltrados.length) setCurrentPage((prev) => prev + 1)
  }

  const handlePrintCatalog = () => {
    const printContainer = document.getElementById("print-catalog");
    if (!printContainer) return;

    const contentHtml = Array.from(printContainer.querySelectorAll('.card, table')).map(el => el.outerHTML).join('');
    const printHtml = `
      <html>
        <head>
          <title>Catálogo de Productos</title>
          <style>
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: sans-serif;
              font-size: 12px;
              padding: 0;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 12px;
            }
            .card {
              border: 1px solid #ccc;
              padding: 6px;
              text-align: center;
            }
            .card-img {
              width: 100%;
              aspect-ratio: 1 / 1;
              object-fit: cover;
              border: 1px solid #ccc;
            }
          }
        </style>
        </head>
        <body>${contentHtml}</body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      position: "fixed", right: "0", bottom: "0",
      width: "0", height: "0", border: "0",
    });
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(printHtml);
    doc.close();

    // esperar que todas las imágenes carguen
    const imgs = doc.querySelectorAll("img");
    const promises = Array.from(imgs).map(img => new Promise(res => {
      img.onload = res;
      img.onerror = res;
    }));

    Promise.all(promises).then(() => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 100);
    });
  };

  return (
    <>
      <Titulos texto="Lista de Productos" />

      <div className="flex gap-1 pb-4">
        <div className="max-w-md ml-auto my-auto">
          <SearchProduct
            onSelectProduct={handleProductSelect}
            onSearchQueryChange={(value) => setSearchQuery(value)}
          />
        </div>

        {/* Botón Ver Catálogo */}
        <div className="flex justify-center mr-auto">
          <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
            <DialogTrigger asChild>
              <Button>Ver Catálogo</Button>
            </DialogTrigger>
            <DialogContent
              ref={dialogRef}
              className="max-w-6xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <DialogTitle>Catálogo de Productos</DialogTitle>
                <div className="space-x-2 pr-10">
                  <Button variant="outline" onClick={() => setConfigOpen(true)}>Configuración</Button>
                  <Button onClick={handlePrintCatalog}>Imprimir</Button>
                </div>
              </div>

              {/* Configuración */}
              {configOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white p-6 rounded-lg shadow-6xl w-full max-w-md relative">
                    <button
                      onClick={() => setConfigOpen(false)}
                      className="absolute top-2 right-4 text-gray-500 hover:text-black"
                    >
                      ✕
                    </button>
                    <h2 className="text-lg font-semibold mb-4">Configuración de Catálogo</h2>

                    <div className="mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showBs}
                          onChange={(e) => setShowBs(e.target.checked)}
                        />
                        Mostrar precios en bolívares (tasa BCV)
                      </label>
                    </div>

                    <div className="mb-2">
                      <label className="block mb-1 font-medium">Formato de impresión</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="tabla">Tabla</option>
                        <option value="cuadricula">Cuadrícula</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {format === "tabla" ? (
                <table className="table-auto w-full text-left border border-gray-400">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Código</th>
                      <th className="border px-2 py-1">Nombre</th>
                      <th className="border px-2 py-1">Precio</th>
                      <th className="border px-2 py-1">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id || product._id || product.name}>
                        <td className="border px-2 py-1">{product.id || "-"}</td>
                        <td className="border px-2 py-1">{product.name}</td>
                        <td className="border px-2 py-1">
                          {showBs ? (
                            <PrecioProducto precio={parseFloat(product.price)} format={0} />
                          ) : (
                            `${product.price} $`
                          )}
                        </td>
                        <td className="border px-2 py-1">{product.quantity ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <div key={product.id || product._id || product.name} className="border p-2 rounded shadow text-center bg-white">
                      <Image
                        src={product.image || ImageNotSupported}
                        alt={product.name}
                        className="w-full h-32 object-contain mb-2"
                        width={100}
                        height={100}
                      />
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-700">
                        {showBs ? (
                          <PrecioProducto precio={parseFloat(product.price)} format={0} />
                        ) : (
                          `${product.price} $`
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Cantidad: {product.quantity ?? "-"}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Área oculta para imprimir */}
              <div id="print-catalog" className="hidden">
                {format === "tabla" ? (
                  <div>
                    <h2>Catálogo de Productos</h2>
                    <table>
                      <thead>
                        <tr><th>Código</th><th>Nombre</th><th>Precio</th><th>Cantidad</th></tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id || p._id || p.name}>
                            <td>{p.id || "-"}</td>
                            <td>{p.name}</td>
                            <td>{showBs ? (
                              <PrecioProducto precio={parseFloat(p.price)} format={0} />
                            ) : (
                              `${p.price} $`
                            )}</td>
                            <td>{p.quantity ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div>
                    <h2>Catálogo de Productos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {products.map((p) => (
                        <div key={p.id || p._id || p.name} className="card border p-2 rounded shadow text-center bg-white">
                          <Image
                            src={p.image || ImageNotSupported.src}
                            alt={p.name}
                            className="w-full h-32 object-contain mb-2"
                            width={100} height={100}
                          />
                          <h4 className="font-semibold">{p.name}</h4>
                          <p className="text-sm text-gray-700">
                            {showBs ? (
                              <PrecioProducto precio={parseFloat(p.price)} format={0} />
                            ) : (
                              `${p.price} $`
                            )}
                          </p>
                          <p className="text-sm">
                            Cantidad: ${p.quantity ?? "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista con paginación (fuera del modal) */}
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
  )
}
