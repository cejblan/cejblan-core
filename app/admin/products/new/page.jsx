"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import ImageNotSupported from "@/public/ImageNotSupported.webp";
import { FcOpenedFolder } from "react-icons/fc";
import { LoadCategoriesData } from "../../components/LoadCategoriesData";

export default function ProductForm() {
  const [product, setProduct] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    category: "",
    quantity: "",
    image: "",
  });

  const [galeriaAbierta, setGaleriaAbierta] = useState(false);
  const [imagenes, setImagenes] = useState({});
  const [paginaGaleria, setPaginaGaleria] = useState(1);
  const [totalPaginasGaleria, setTotalPaginasGaleria] = useState(1);
  const porPagina = 36;

  const form = useRef(null);
  const router = useRouter();
  const params = useParams();
  const [dataCategories, setDataCategories] = useState([]);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("description", product.description || "Descripción no disponible");
    formData.append("category", product.category);
    formData.append("quantity", product.quantity || 0);
    if (product.image) formData.append("imageUrl", product.image);

    const url = params.id ? `/api/admin/products/${params.id}` : "/api/admin/products";
    const method = params.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
      await res.json();
      alert("Producto Registrado");
      form.current.reset();
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  };

  const cargarImagenesGaleria = async () => {
    try {
      const res = await fetch(`/api/cms/images?page=${paginaGaleria}&limit=${porPagina}`);
      const data = await res.json();
      const agrupadas = {};
      (data.imagenes || []).forEach(img => {
        const partes = img.pathname.split('/');
        const folder = partes.length > 1 ? partes.slice(0, -1).join('/') : '/';
        if (!agrupadas[folder]) agrupadas[folder] = [];
        agrupadas[folder].push(img);
      });
      setImagenes(agrupadas);
      setTotalPaginasGaleria(data.totalPaginas || 1);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
    }
  };

  useEffect(() => { if (galeriaAbierta) cargarImagenesGaleria(); }, [galeriaAbierta, paginaGaleria]);

  useEffect(() => {
    LoadCategoriesData(setDataCategories).catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (params.id) {
          const res = await fetch(`/api/admin/products/${params.id}`);
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          setProduct({
            id: String(data[0].id ?? "").padStart(4, "0"),
            name: data[0].name ?? "",
            price: data[0].price ?? "",
            description: data[0].description ?? "",
            category: data[0].category ?? "",
            quantity: data[0].quantity ?? "",
            image: data[0].image ?? "",
          });
        } else {
          const res = await fetch("/api/admin/products/next-id");
          if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          setProduct((prev) => ({ ...prev, id: String(data.nextId).padStart(4, "0") }));
        }
      } catch (error) {
        console.error("Error al cargar el producto o ID:", error);
      }
    };
    fetchProduct();
  }, [params.id]);

  return (
    <>
      <Link href={params.id ? `/admin/products/${params.id}` : "/admin/products"} className=" bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>
      <form onSubmit={handleSubmit} ref={form} className="pl-3" >
        <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-2 justify-center mb-4">
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto ml-4 max-[420px]:w-full">
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="price" className="text-lg font-semibold pr-1 block">ID:</label>
              <input name="id" id="id" type="text" placeholder="id" inputMode="numeric" pattern="\d*" maxLength={4} onChange={(e) => { const value = e.target.value; if (/^\d{0,4}$/.test(value)) setProduct((prev) => ({ ...prev, id: value })); }} value={product.id} className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full" />
            </div>
            <div className="mb-1">
              <label htmlFor="name" className="text-lg font-semibold pr-1 mb-1 block">Nombre:</label>
              <input name="name" id="name" type="text" placeholder="Nombre" onChange={handleChange} value={product.name} className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full" autoFocus required />
            </div>
            <div className="mb-1">
              <label htmlFor="description" className="text-lg font-semibold pr-1 mb-1 block">Descripción:</label>
              <textarea name="description" id="description" rows={1} placeholder="Descripción" onChange={handleChange} value={product.description} className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full" />
            </div>
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="price" className="text-lg font-semibold pr-1 block">Precio:</label>
              <input name="price" id="price" type="number" placeholder="00.00$" onChange={handleChange} value={product.price} className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full" required />
            </div>
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="quantity" className="text-lg font-semibold pr-1 block">Cantidad:</label>
              <input name="quantity" id="quantity" type="number" placeholder="Cantidad" onChange={handleChange} value={product.quantity} min="0" className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full" required />
            </div>
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="category" className="text-lg font-semibold pr-1 block">Categoría:</label>
              <select name="category" id="category" onChange={handleChange} value={product.category} className="hover:bg-blue-200 max-[420px]:text-center py-1 px-2 rounded-md w-full" required>
                <option value="">Selecciona una categoría</option>
                {dataCategories.map((option, index) => (
                  <option key={index} value={option.name}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="max-[420px]:text-center text-left mx-auto">
            <h2 className="text-lg font-semibold pr-1 mb-1 w-full">Imagen:</h2>
            <div className="relative">
              <Image src={product.image || ImageNotSupported} className="rounded-md drop-shadow-6xl m-auto" alt={product.name} width={200} height={200} />
              <div className="text-xs absolute max-[420px]:top-1/3 top-2/3 left-0 w-full flex justify-center">
                <button type="button" onClick={() => setGaleriaAbierta(true)} className="bg-blue-500 hover:bg-blue-500 text-white py-1 px-3 rounded-xl shadow-6xl mx-auto">Seleccionar</button>
              </div>
            </div>
          </div>
        </div>
        <button className="text-white bg-blue-500 hover:bg-blue-600 font-bold py-1 px-2 rounded-xl shadow-6xl mx-auto w-fit">
          {params.id ? "Actualizar Producto" : "Crear Producto"}
        </button>
      </form>

      {galeriaAbierta && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-xl p-4 max-w-4xl w-full m-4 max-h-[90vh] overflow-auto">
            <button onClick={() => setGaleriaAbierta(false)} className="absolute top-2 right-2 text-slate-600 hover:text-black text-xl">✕</button>
            <h2 className="text-lg font-bold mb-4">Seleccionar imagen</h2>
            <div className="space-y-6">
              {Object.entries(imagenes).map(([folder, imgs]) => (
                <div key={folder}>
                  <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                    <FcOpenedFolder className="text-xl" />
                    <span>{folder === '/' ? 'Raíz' : folder}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imgs.map((img, i) => (
                      <div key={i} className="relative w-full aspect-square border rounded-2xl overflow-hidden bg-slate-100 cursor-pointer">
                        <img
                          src={img.url}
                          alt={img.pathname}
                          className="object-cover w-full h-full"
                          onClick={() => {
                            setProduct(prev => ({ ...prev, image: img.url }));
                            setGaleriaAbierta(false);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => setPaginaGaleria((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400" disabled={paginaGaleria === 1}>Anterior</button>
              <span className="px-2 py-1">{paginaGaleria}/{totalPaginasGaleria}</span>
              <button onClick={() => setPaginaGaleria((p) => Math.min(totalPaginasGaleria, p + 1))} className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400" disabled={paginaGaleria === totalPaginasGaleria}>Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}