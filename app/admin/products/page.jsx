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
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

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
  useEffect(() => {
    if (configOpen && dialogRef.current) dialogRef.current.style.overflow = "hidden"
    else if (dialogRef.current) dialogRef.current.style.overflow = "auto"
    return () => { if (dialogRef.current) dialogRef.current.style.overflow = "auto" }
  }, [configOpen])

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

  const handlePrintCatalogPDF = async () => {
    const element = document.getElementById("print-catalog")
    if (!element) return
    const clone = element.cloneNode(true)
    clone.style.display = "block"
    clone.style.position = "absolute"
    clone.style.top = "-10000px"
    document.body.appendChild(clone)

    const canvas = await html2canvas(clone, { scale: 2 })
    document.body.removeChild(clone)

    const imgData = canvas.toDataURL("image/jpeg", 1.0)
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight)
    pdf.save("catalogo-productos.pdf")
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
                  <Button onClick={handlePrintCatalogPDF}>Descargar PDF</Button>
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

              {format === "tabla" ? (
                <table className="w-full border border-gray-500 border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-400 px-2 py-1">Código</th>
                      <th className="border border-gray-400 px-2 py-1">Nombre</th>
                      <th className="border border-gray-400 px-2 py-1">Precio</th>
                      <th className="border border-gray-400 px-2 py-1">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id || p._id || p.name}>
                        <td className="border border-gray-400 px-2 py-1">{p.id || "-"}</td>
                        <td className="border border-gray-400 px-2 py-1">{p.name}</td>
                        <td className="border border-gray-400 px-2 py-1">{showBs ? <PrecioProducto precio={parseFloat(p.price)} format={0} /> : `${p.price} $`}</td>
                        <td className="border border-gray-400 px-2 py-1">{p.quantity ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <div key={p.id || p._id || p.name} className="border p-2 rounded shadow text-center bg-white">
                      <img src={p.image || ImageNotSupported.src} alt={p.name} className="w-full aspect-square object-cover mb-2" />
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      <p className="text-xs text-gray-700">
                        {showBs ? <PrecioProducto precio={parseFloat(p.price)} format={0} /> : `${p.price} $`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Cantidad: {p.quantity ?? "-"}</p>
                    </div>
                  ))}
                </div>
              )}

              <div id="print-catalog" className="hidden p-6 bg-white text-black">
                {format === "tabla" ? (
                  <div>
                    <h2>Catálogo de Productos</h2>
                    <table className="w-full border border-gray-500 border-collapse text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-400 px-2 py-1">Código</th>
                          <th className="border border-gray-400 px-2 py-1">Nombre</th>
                          <th className="border border-gray-400 px-2 py-1">Precio</th>
                          <th className="border border-gray-400 px-2 py-1">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id || p._id || p.name}>
                            <td className="border border-gray-400 px-2 py-1">{p.id || "-"}</td>
                            <td className="border border-gray-400 px-2 py-1">{p.name}</td>
                            <td className="border border-gray-400 px-2 py-1">{showBs ? <PrecioProducto precio={parseFloat(p.price)} format={0} /> : `${p.price} $`}</td>
                            <td className="border border-gray-400 px-2 py-1">{p.quantity ?? "-"}</td>
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
                        <div key={p.id || p._id || p.name} className="border p-2 rounded shadow text-center bg-white">
                          <img src={p.image || ImageNotSupported.src} alt={p.name} className="w-full aspect-square object-cover mb-2" />
                          <h4 className="font-semibold text-sm">{p.name}</h4>
                          <p className="text-xs">
                            {showBs ? <PrecioProducto precio={parseFloat(p.price)} format={0} /> : `${p.price} $`}
                          </p>
                          <p className="text-xs">Cantidad: {p.quantity ?? "-"}</p>
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
