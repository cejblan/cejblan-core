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

  // Estados para configuraciones adicionales
  const [fontH2, setFontH2] = useState("15px")
  const [fontTitle, setFontTitle] = useState("9px")
  const [fontTextXS, setFontTextXS] = useState("9px")
  const [fontTable, setFontTable] = useState("12px")
  const [gridColumns, setGridColumns] = useState("grid4")
  const [showQuantity, setShowQuantity] = useState(true)

  // Secciones del modal
  const sections = ["Generales", "Fuentes", "Tabla", "Cuadrícula"]
  const [activeSection, setActiveSection] = useState("Generales")

  const itemsPerPage = 12
  const dialogRef = useRef(null)

  useEffect(() => {
    LoadProducts(setProducts)
  }, [])

  useEffect(() => {
    if (configOpen && dialogRef.current) {
      dialogRef.current.style.overflow = "hidden"
    } else if (dialogRef.current) {
      dialogRef.current.style.overflow = "auto"
    }
    return () => {
      if (dialogRef.current) dialogRef.current.style.overflow = "auto"
    }
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

  const handlePrint = () => {
    const printContent = document.getElementById("print-catalog")
    if (!printContent) return

    const clonedContent = printContent.cloneNode(true)
    const images = clonedContent.querySelectorAll("img")
    const preloadImages = Array.from(images).map((img) =>
      new Promise((resolve) => {
        const src = img.getAttribute("src") || ImageNotSupported.src
        fetch(src)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader()
            reader.onload = () => {
              img.setAttribute("src", reader.result)
              resolve()
            }
            reader.onerror = resolve
            reader.readAsDataURL(blob)
          })
          .catch(resolve)
      })
    )

    Promise.all(preloadImages).then(() => {
      const iframe = document.createElement("iframe")
      iframe.style.position = "fixed"
      iframe.style.right = "0"
      iframe.style.bottom = "0"
      iframe.style.width = "0"
      iframe.style.height = "0"
      iframe.style.border = "0"
      document.body.appendChild(iframe)

      const doc = iframe.contentDocument || iframe.contentWindow.document
      const styles = `
        <style>
          @media print {
            @page { margin: 20mm; }
            body { -webkit-print-color-adjust: exact; background: white; }
          }
          table {
            border-collapse: collapse;
            width: 100%;
            font-size: ${fontTable};
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 3px;
            text-align: center;
          }
          h2 {
            font-size: ${fontH2};
            font-weight: bold;
            margin-bottom: 9px;
            text-align: center;
            margin-top: -12px;
          }
          .grid { display: grid; gap: 9px; }
          .grid4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .grid5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .card {
            border: 1px solid #e5e7eb;
            padding: 6px;
            border-radius: 6px;
            text-align: center;
            background-color: #ffffff;
          }
          .img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; margin-bottom: 3px; }
          .title { font-weight: 600; font-size: ${fontTitle}; }
          .text-xs {
            font-size: ${fontTextXS};
            color: #374151;
            padding: 0;
            margin: 0;
          }
        </style>
      `

      doc.open()
      doc.write(`
        <html>
          <head><title>Catálogo de Productos</title>${styles}</head>
          <body>${clonedContent.innerHTML}</body>
        </html>
      `)
      doc.close()

      iframe.onload = () => {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        setTimeout(() => document.body.removeChild(iframe), 1000)
      }
    })
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
              <div className="flex gap-1 items-center mb-4">
                <DialogTitle />
                <Button variant="outline" onClick={() => setConfigOpen(true)}>Configuración</Button>
                <Button onClick={handlePrint}>Imprimir</Button>
              </div>

              {configOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl h-4/5 flex overflow-hidden">
                    {/* Sidebar de secciones */}
                    <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r">
                      <h3 className="font-semibold mb-4">Secciones</h3>
                      <div className="space-y-2 text-sm">
                        {sections.map((sec) => (
                          <div
                            key={sec}
                            onClick={() => setActiveSection(sec)}
                            className={`cursor-pointer p-2 rounded ${activeSection === sec ? "bg-blue-200 font-semibold" : ""
                              }`}
                          >
                            {sec}
                          </div>
                        ))}
                      </div>
                    </aside>

                    {/* Contenido de sección */}
                    <div className="w-3/4 p-6 overflow-y-auto relative">
                      <button
                        onClick={() => setConfigOpen(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-black"
                      >
                        ✕
                      </button>
                      <h2 className="text-xl font-semibold mb-6">Configuración de Catálogo</h2>

                      {/* Generales */}
                      {activeSection === "Generales" && (
                        <div className="space-y-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={showBs}
                              onChange={(e) => setShowBs(e.target.checked)}
                            />
                            Mostrar precios en bolívares (tasa BCV)
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={showQuantity}
                              onChange={(e) => setShowQuantity(e.target.checked)}
                            />
                            Mostrar columna de cantidad
                          </label>
                          <label className="block font-medium">Formato de impresión</label>
                          <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="tabla">Tabla</option>
                            <option value="cuadricula">Cuadrícula</option>
                          </select>
                        </div>
                      )}

                      {/* Fuentes */}
                      {activeSection === "Fuentes" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block font-medium">Tamaño de h2</label>
                            <select
                              value={fontH2}
                              onChange={(e) => setFontH2(e.target.value)}
                              className="w-full border rounded px-3 py-2"
                            >
                              <option value="9px">9px</option>
                              <option value="12px">12px</option>
                              <option value="15px">15px</option>
                              <option value="18px">18px</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium">Tamaño de .title</label>
                            <select
                              value={fontTitle}
                              onChange={(e) => setFontTitle(e.target.value)}
                              className="w-full border rounded px-3 py-2"
                            >
                              <option value="9px">9px</option>
                              <option value="12px">12px</option>
                              <option value="15px">15px</option>
                              <option value="18px">18px</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium">Tamaño de .text-xs</label>
                            <select
                              value={fontTextXS}
                              onChange={(e) => setFontTextXS(e.target.value)}
                              className="w-full border rounded px-3 py-2"
                            >
                              <option value="9px">9px</option>
                              <option value="12px">12px</option>
                              <option value="15px">15px</option>
                              <option value="18px">18px</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium">Tamaño de texto de tabla</label>
                            <select
                              value={fontTable}
                              onChange={(e) => setFontTable(e.target.value)}
                              className="w-full border rounded px-3 py-2"
                            >
                              <option value="9px">9px</option>
                              <option value="12px">12px</option>
                              <option value="15px">15px</option>
                              <option value="18px">18px</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Tabla */}
                      {activeSection === "Tabla" && (
                        <div className="space-y-4">
                          {/* Si en el futuro hay opciones propias de tabla, irían aquí */}
                        </div>
                      )}

                      {/* Cuadrícula */}
                      {activeSection === "Cuadrícula" && (
                        <div>
                          <label className="block font-medium">
                            Columnas de la cuadrícula
                          </label>
                          <select
                            value={gridColumns}
                            onChange={(e) => setGridColumns(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="grid4">4 columnas</option>
                            <option value="grid5">5 columnas</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Catálogo para impresión */}
              <div id="print-catalog" className="p-2 bg-white text-black">
                <h2 className="text-xl font-bold mb-4">Catálogo de Productos</h2>
                {format === "tabla" ? (
                  <table className="w-full border-collapse text-center text-sm" style={{ fontSize: fontTable }}>
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-[3px]">Código</th>
                        <th className="border border-gray-300 p-[3px]">Nombre</th>
                        <th className="border border-gray-300 p-[3px]">Precio</th>
                        {showQuantity && <th className="border border-gray-300 p-[3px]">Cantidad</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id || p._id || p.name}>
                          <td className="border border-gray-300 p-[3px]">{p.id || "-"}</td>
                          <td className="border border-gray-300 p-[3px]">{p.name}</td>
                          <td className="border border-gray-300 p-[3px]">
                            {showBs
                              ? <PrecioProducto precio={parseFloat(p.price)} format={0} />
                              : `${p.price} $`}
                          </td>
                          {showQuantity && <td className="border border-gray-300 p-[3px]">{p.quantity ?? "-"}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${gridColumns}`}>
                    {products.map((p) => (
                      <div
                        key={p.id || p._id || p.name}
                        className="card border p-2 rounded shadow text-center bg-white"
                      >
                        <img
                          src={p.image || ImageNotSupported.src}
                          onError={(e) => (e.target.src = ImageNotSupported.src)}
                          alt={p.name}
                          className="img w-full aspect-square mb-2"
                        />
                        <h4 className="title font-semibold" style={{ fontSize: fontTitle }}>
                          {p.name}
                        </h4>
                        <p className="text-xs" style={{ fontSize: fontTextXS }}>
                          {showBs
                            ? <PrecioProducto precio={parseFloat(p.price)} format={0} />
                            : `${p.price} $`}
                        </p>
                        {showQuantity && (
                          <p className="text-xs" style={{ fontSize: fontTextXS }}>
                            Cantidad: {p.quantity ?? "-"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid max-[420px]:grid-cols-1 grid-cols-4 gap-1 pb-4">
        {currentProducts.map((product) => (
          <ProductCardAdmin key={product.id || product._id || product.name} product={product} />
        ))}
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
          disabled={endIndex >= productosFiltrados.length}
          className="px-2 py-1 bg-white rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <p className="text-center font-bold mt-1">
        Página {currentPage} de {Math.ceil(productosFiltrados.length / itemsPerPage)}
      </p>
    </>
  )
}
