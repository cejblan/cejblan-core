// Código actualizado: impresión con estilos en línea equivalentes a los estilos Tailwind usados en pantalla

"use client"

import { useState, useEffect, useRef } from "react"
import Titulos from "@/components/editable/Titulos"
import { LoadProducts } from "../components/LoadProducts"
import ProductCardAdmin from "../components/ProductCardAdmin"
import SearchProduct from "@/app/admin/components/SearchProduct"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/app/admin/components/ui/dialog"
import { Button } from "@/app/admin/components/ui/button"
import PrecioProducto from "@/components/editable/PrecioProducto"
import ImageNotSupported from "@/public/ImageNotSupported.webp"

export default function ProductsPageAdmin() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [showBs, setShowBs] = useState(false)
  const [format, setFormat] = useState("tabla")
  const [configOpen, setConfigOpen] = useState(false)
  const itemsPerPage = 12
  const dialogRef = useRef(null)

  useEffect(() => { LoadProducts(setProducts) }, [])

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

  const handlePrint = () => {
    const printContent = document.getElementById("print-catalog")
    if (!printContent) return

    const printWindow = window.open("", "_blank")

    const styles = `
      <style>
        @media print {
          @page { margin: 20mm; }
          body { -webkit-print-color-adjust: exact; }
        }
        table { border-collapse: collapse; width: 100%; font-size: 14px; }
        th, td { border: 1px solid #d1d5db; padding: 3px; text-align: center; }
        h2 { font-size: 20px; font-weight: bold; margin-bottom: 16px; text-align: center; }
        .grid { display: grid; gap: 16px; }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .card { border: 1px solid #e5e7eb; padding: 8px; border-radius: 8px; text-align: center; background-color: #ffffff; }
        .img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; margin-bottom: 8px; }
        .title { font-weight: 600; font-size: 14px; }
        .text-xs { font-size: 12px; color: #374151; padding: 0px; margin: 0px; }
      </style>
    `

    printWindow.document.write(`
      <html>
        <head>
          <title>Catálogo de Productos</title>
          ${styles}
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <>
      <Titulos texto="Lista de Productos" />
      <div className="flex gap-1 pb-4">
        <div className="max-w-md ml-auto my-auto">
          <SearchProduct onSelectProduct={handleProductSelect} onSearchQueryChange={setSearchQuery} />
        </div>
        <div className="flex justify-center mr-auto">
          <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
            <DialogTrigger asChild>
              <Button>Ver Catálogo</Button>
            </DialogTrigger>
            <DialogContent ref={dialogRef} className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle>Catálogo de Productos</DialogTitle>
                <div className="space-x-2 pr-10">
                  <Button variant="outline" onClick={() => setConfigOpen(true)}>Configuración</Button>
                  <Button onClick={handlePrint}>Imprimir</Button>
                </div>
              </div>

              {configOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white p-6 rounded-lg shadow-6xl w-full max-w-md relative">
                    <button onClick={() => setConfigOpen(false)} className="absolute top-2 right-4 text-gray-500 hover:text-black">✕</button>
                    <h2 className="text-lg font-semibold mb-4">Configuración de Catálogo</h2>
                    <label className="flex items-center gap-2 mb-4">
                      <input type="checkbox" checked={showBs} onChange={(e) => setShowBs(e.target.checked)} />
                      Mostrar precios en bolívares (tasa BCV)
                    </label>
                    <label className="block mb-2 font-medium">Formato de impresión</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full border rounded px-3 py-2">
                      <option value="tabla">Tabla</option>
                      <option value="cuadricula">Cuadrícula</option>
                    </select>
                  </div>
                </div>
              )}

              <div id="print-catalog" className="p-6 bg-white text-black text-sm leading-none">
                <h2 className="text-xl font-bold mb-4">Catálogo de Productos</h2>
                {format === "tabla" ? (
                  <table className="w-full border border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-[3px]">Código</th>
                        <th className="border p-[3px]">Nombre</th>
                        <th className="border p-[3px]">Precio</th>
                        <th className="border p-[3px]">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id || p._id || p.name}>
                          <td className="border p-[3px]">{p.id || "-"}</td>
                          <td className="border p-[3px]">{p.name}</td>
                          <td className="border p-[3px]">{showBs ? <PrecioProducto precio={parseFloat(p.price)} format={0} /> : `${p.price} $`}</td>
                          <td className="border p-[3px]">{p.quantity ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {products.map((p) => (
                      <div key={p.id || p._id || p.name} className="card border p-2 rounded shadow text-center bg-white">
                        <img
                          src={p.image || ImageNotSupported.src}
                          onError={(e) => { e.target.src = ImageNotSupported.src }}
                          alt={p.name}
                          className="img w-full aspect-square object-cover mb-2"
                        />
                        <h4 className="title font-semibold text-sm">{p.name}</h4>
                        <p className="text-xs">{showBs ? <PrecioProducto precio={parseFloat(p.price)} format={0} /> : `${p.price} $`}</p>
                        <p className="text-xs">Cantidad: {p.quantity ?? "-"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid max-[420px]:grid-cols-1 grid-cols-4 gap-1 justify-center items-center pb-4">
        {currentProducts.map((product) => (<ProductCardAdmin key={product.id || product.__id || product.name} product={product} />))}
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50">Anterior</button>
        <button onClick={handleNextPage} disabled={endIndex >= productosFiltrados.length} className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
      </div>

      <p className="text-center font-bold mt-1 mx-auto w-fit">Página {currentPage} de {Math.ceil(productosFiltrados.length / itemsPerPage)}</p>
    </>
  )
}
