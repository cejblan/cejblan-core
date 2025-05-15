"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import SearchProduct from "../components/SearchProduct";

export default function PrintModal() {
  const [products, setProducts] = useState([
    { id: 1, product: null, price: "", quantity: "" },
  ]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showFormatModal, setShowFormatModal] = useState(false);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      { id: Date.now(), product: null, price: "", quantity: "" },
    ]);
  };

  const handlePrint = () => {
    const content = document.getElementById("print-area")?.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(`
      <html>
        <head>
          <title>Nota de Entrega</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2, p { margin: 0 0 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 14px; }
            .total { text-align: right; margin-top: 10px; font-weight: bold; }
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Notas de Entrega</h2>
      <table className="table-auto bg-white text-slate-900 tracking-tight rounded-t-xl rounded-ee-xl shadow-6xl w-full mb-4">
        <thead className="bg-slate-300 max-[420px]:text-xs text-lg font-semibold">
          <tr>
            <td className="border-r border-b border-slate-900 rounded-tl-xl">Producto</td>
            <td className="border-r border-b border-slate-900">Precio</td>
            <td className="border-r border-b border-slate-900">Cantidad</td>
            <td className="bg-slate-600 text-white border-b border-slate-900 rounded-tr-xl">Total</td>
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
              <td className="font-bold border-t border-slate-900">
                {item.price && item.quantity
                  ? (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2) + " Bs"
                  : "-"}
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
          <h2 className="text-xl font-semibold mb-4">Datos del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Nombre completo"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              placeholder="Teléfono"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
            <Input
              placeholder="Dirección"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <select
              className="border rounded-md px-4 py-2 w-full"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Seleccione forma de pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Pago móvil">Pago móvil</option>
              <option value="Zelle">Zelle</option>
            </select>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button variant="outline" onClick={() => setShowFormatModal(true)}>
              Formato de impresión
            </Button>
          </div>

          <div id="print-area" className="hidden">
            <h2>Nota de Entrega</h2>
            <p><strong>Cliente:</strong> {clientName}</p>
            <p><strong>Teléfono:</strong> {clientPhone}</p>
            <p><strong>Dirección:</strong> {clientAddress}</p>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.product?.name || "-"}</td>
                    <td>{p.price} Bs</td>
                    <td>{p.quantity}</td>
                    <td>{(parseFloat(p.price) * parseInt(p.quantity)).toFixed(2)} Bs</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="total">Total: {total.toFixed(2)} Bs</p>
            <p><strong>Forma de pago:</strong> {paymentMethod}</p>
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
                <p className="text-sm text-gray-600 mb-2">Aquí podrás personalizar los campos y contenido del documento.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
