"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import SearchProduct from "../components/SearchProduct";
import { LoadPayments } from "../components/LoadPayments";
import Titulos from "@/components/Titulos";
import PrecioProducto from "@/app/components/PrecioProducto";

export default function DeliveryNote() {
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([
    { id: 1, product: null, price: "", quantity: "" },
  ]);
  const [clientName, setClientName] = useState("");
  const [documentType, setDocumentType] = useState("V");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("0414");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [customHeader, setCustomHeader] = useState("MI NEGOCIO, C.A.");
  const [customAddress, setCustomAddress] = useState("Dirección del negocio editable");
  const [customRif, setCustomRif] = useState("J-000000000");
  const [showPhone, setShowPhone] = useState(true);
  const [showAddress, setShowAddress] = useState(true);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      { id: Date.now(), product: null, price: "", quantity: "" },
    ]);
  };

  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [formato, setFormato] = useState({
    blocks: {
      header: { alignment: "left", visible: true },
      noteInfo: { alignment: "left", visible: true },
      client: { alignment: "left", visible: true },
      products: { alignment: "left", visible: true },
      totals: { alignment: "right", visible: true },
    },
  });

  const handlePrint = () => {
    const content = document.getElementById("print-area")?.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(`
      <html>
        <head>
          <title>Nota de Entrega</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
  
            body {
              font-family: sans-serif;
              font-size: 11px;
              width: 80mm;
              padding: 10px;
              margin: auto;
              white-space: pre-wrap;
            }
  
            .center {
              text-align: center;
            }
  
            .line {
              border-top: 1px dashed #000;
              margin: 4px 0;
            }
  
            .total {
              font-weight: bold;
              text-align: right;
            }
  
            .footer {
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
    printWindow?.close();
  };

  const total = products.reduce((acc, product) => {
    const price = parseFloat(product.price);
    const quantity = parseInt(product.quantity);
    if (!isNaN(price) && !isNaN(quantity)) {
      return acc + price * quantity;
    }
    return acc;
  }, 0);

  const taxRate = 0.16;
  const baseAmount = total / (1 + taxRate);
  const ivaAmount = total - baseAmount;

  const removeProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const canPrint = products.some(
    (p) => p.product && p.price && p.quantity && parseInt(p.quantity) > 0
  );

  useEffect(() => {
    LoadPayments(setPayments);
  }, [setPayments]);

  return (
    <>
      <Titulos texto="Notas de Entrega" />
      <table className="table-auto bg-white text-slate-900 tracking-tight rounded-t-xl rounded-ee-xl shadow-6xl w-full mb-4">
        <thead className="bg-slate-300 max-[420px]:text-xs text-lg font-semibold">
          <tr>
            <td className="border-r border-b border-slate-900 rounded-tl-xl">Producto</td>
            <td className="border-r border-b border-slate-900">Precio</td>
            <td className="border-r border-b border-slate-900">Cantidad</td>
            <td className="border-r border-b border-slate-900">Total</td>
            <td className="bg-slate-600 text-white border-b border-slate-900 rounded-tr-xl">Acción</td>
          </tr>
        </thead>
        <tbody className="max-[420px]:text-xs text-base">
          {products.map((item, index) => (
            <tr key={item.id}>
              <td className="border-r border-t border-slate-900">
                <SearchProduct
                  onSelectProduct={(product) => {
                    const updated = [...products];
                    updated[index].product = product;
                    updated[index].price = product.price || "";
                    updated[index].quantity = product.quantity || "";
                    setProducts(updated);
                  }}
                />
              </td>
              <td className="border-r border-t border-slate-900">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => {
                    const updated = [...products];
                    updated[index].price = e.target.value;
                    setProducts(updated);
                  }}
                  className="bg-white max-[420px]:text-center py-1 px-2 w-full"
                  placeholder="00.00$"
                />
              </td>
              <td className="border-r border-t border-slate-900">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...products];
                    updated[index].quantity = e.target.value;
                    setProducts(updated);
                  }}
                  className="bg-white max-[420px]:text-center py-1 px-2 w-full"
                  placeholder="Cantidad"
                />
              </td>
              <td className="font-bold border-r border-t border-slate-900">
                {item.price && item.quantity
                ? <PrecioProducto precio={Number((parseFloat(item.price) * parseInt(item.quantity)).toFixed(2))} format={0} /> : (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
              </td>
              <td className="border-t border-slate-900 text-center">
                <button
                  onClick={() => removeProduct(item.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <X size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={handleAddProduct}>Agregar producto</Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="ml-4">Datos del Cliente</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <div id="print-area" className="hidden">
            <p className="center">{customHeader}</p>
            <p className="center">{customAddress}</p>
            <p className="center">RIF: {customRif}</p>
            <p>Fecha: {now.toLocaleDateString()}  Hora: {time}</p>
            <div className="line" />
            <p>Cliente: {clientName}</p>
            <p>Documento: {documentType}-{documentNumber}</p>
            {showPhone && <p>Teléfono: {phoneCode}-{phoneNumber}</p>}
            {showAddress && <p>Dirección: {clientAddress}</p>}
            <div className="line" />
            {products.map((p) => (
              <div key={p.id}>
                <p>{p.product?.name || "-"}</p>
                <p>{p.quantity} x {p.price} Bs</p>
                <p>Total: {(parseFloat(p.price) * parseInt(p.quantity)).toFixed(2)} Bs</p>
                <div className="line" />
              </div>
            ))}
            <p className="total">SUBTOTAL: {baseAmount.toFixed(2)} Bs</p>
            <p className="total">IVA (16%): {ivaAmount.toFixed(2)} Bs</p>
            <p className="total">TOTAL: {total.toFixed(2)} Bs</p>
            <p className="footer">Forma de pago: {paymentMethod}</p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Datos del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Nombre completo" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <div className="flex gap-2">
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="border rounded-md px-2">
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="RIF">RIF</option>
              </select>
              <Input placeholder="Documento" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className="border rounded-md px-2">
                <option value="0412">0412</option>
                <option value="0414">0414</option>
                <option value="0424">0424</option>
                <option value="0416">0416</option>
                <option value="0426">0426</option>
              </select>
              <Input placeholder="Teléfono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
          </div>
          <textarea
            placeholder="Dirección completa"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mb-4"
          />

          <div className="mt-4">
            <select className="border rounded-md px-4 py-2 w-full" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">Seleccione forma de pago</option>
              {
                payments.map((payments, index) => {
                  return (
                    <option key={index} value={payments.name}>{payments.name}</option>
                  )
                })}
            </select>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={handlePrint} disabled={!canPrint} title={!canPrint ? "Debe ingresar al menos un producto con cantidad mayor a cero" : ""}>
              Imprimir
            </Button>
            <Button variant="outline" onClick={() => setShowFormatModal(true)}>
              Formato de impresión
            </Button>
          </div>

          {showFormatModal && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg max-w-xl w-full relative">
                <button
                  className="absolute right-4 top-4 text-gray-500 hover:text-black"
                  onClick={() => setShowFormatModal(false)}
                >
                  <X />
                </button>
                <h2 className="text-lg font-bold mb-4">Editor de Formato</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título del documento</label>
                    <Input value={customHeader} onChange={(e) => setCustomHeader(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección del negocio</label>
                    <Input value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RIF del negocio</label>
                    <Input value={customRif} onChange={(e) => setCustomRif(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} />
                    <label className="text-sm">Mostrar teléfono del cliente</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={showAddress} onChange={(e) => setShowAddress(e.target.checked)} />
                    <label className="text-sm">Mostrar dirección del cliente</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
