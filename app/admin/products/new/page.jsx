"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import ImageNotSupported from "@/public/ImageNotSupported.webp";
import { LoadCategoriesData } from "../../components/LoadCategoriesData";

export default function ProductForm() {
  const [product, setProduct] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    category: "",
    quantity: 1,
    image: "",
    id: "",
  });

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
    let description = product.description || "Descripción no disponible";
    formData.append("description", description);
    /* Se comento codigo innecesario
    formData.append("iva", product.iva);
    */
    formData.append("category", product.category);
    let quantity = product.quantity || 0;
    formData.append("quantity", quantity);

    if (file) {
      formData.append("image", file);
    }

    const url = params.id ? `/api/admin/products/${params.id}` : "/api/admin/products";
    const method = params.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData, // FormData se pasa directamente
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log(
        params.id ? "Producto actualizado:" : "Producto creado:",
        data
      );
    } catch (error) {
      console.error(
        params.id ? "Error al actualizar el producto:" : "Error al crear el producto:",
        error
      );
    }

    alert("Producto Registrado");
    form.current.reset();
    router.push("/admin/products");
    router.refresh(); // Solo actualiza los componentes del servidor
  };
  //Estilos input
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("Ningún archivo seleccionado");
  const handleChange2 = (event) => {
    const files = event.target.files;
    if (files.length === 0) {
      setFileName(dataEmpty);
    } else if (files.length > 1) {
      setFileName(`${files.length} archivos seleccionados`);
    } else {
      setFileName(files[0].name);
    }
    setFile(event.target.files[0]);
  };
  //Fin estilos input

  useEffect(() => {
    const loadData = async () => {
      try {
        await LoadCategoriesData(setDataCategories);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    loadData();
  }, []); // <- ESTA LÍNEA evita el bucle infinito

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (params.id) {
          const res = await fetch(`/api/admin/products/${params.id}`);
          if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
          }
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
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      }
    };

    fetchProduct();
  }, [params.id]);

  return (
    <>
      <Link href={params.id ? `/admin/products/${params.id}` : "/admin/products"} className=" bg-slate-600 text-white hover:text-blue-300 text-xl p-1 rounded-md w-fit block absolute top-2 left-2 shadow-6xl">
        <FaArrowLeft />
      </Link>
      <form onSubmit={handleSubmit} ref={form} >
        <div className="grid max-[420px]:grid-cols-1 grid-cols-2 gap-2 justify-center mb-4">
          <div className="max-[420px]:text-center text-left max-[420px]:pt-4 max-[420px]:mx-auto ml-4 max-[420px]:w-full">
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="price" className="text-lg font-semibold pr-1 block">
                ID:
              </label>
              <input
                name="id"
                id="id"
                type="text"
                placeholder="id"
                onChange={handleChange}
                value={product.id}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
              />
            </div>
            <div className="mb-1">
              <label htmlFor="name" className="text-lg font-semibold pr-1 mb-1 block">
                Nombre:
              </label>
              <input
                name="name"
                id="name"
                type="text"
                placeholder="Nombre"
                onChange={handleChange}
                value={product.name}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                autoFocus
                required
              />
            </div>
            <div className="mb-1">
              <label htmlFor="description" className="text-lg font-semibold pr-1 mb-1 block">
                Descripción:
              </label>
              <textarea
                name="description"
                id="description"
                rows={1}
                placeholder="Descripción"
                onChange={handleChange}
                value={product.description}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
              />
            </div>
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="price" className="text-lg font-semibold pr-1 block">
                Precio:
              </label>
              <input
                name="price"
                id="price"
                type="number"
                placeholder="00.00$"
                onChange={handleChange}
                value={product.price}
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                required
              />
            </div>
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="quantity" className="text-lg font-semibold pr-1 block">
                Cantidad:
              </label>
              <input
                name="quantity"
                id="quantity"
                type="number"
                placeholder="Cantidad"
                onChange={handleChange}
                value={product.quantity || 1}
                min="0"
                className="bg-white max-[420px]:text-center py-1 px-2 rounded-md w-full"
                required
              />
            </div>
            <div className="mb-1 flex gap-1 justify-center items-center">
              <label htmlFor="category" className="text-lg font-semibold pr-1 block">
                Categoría:
              </label>
              <select
                name="category"
                id="category"
                onChange={handleChange}
                value={product.category}
                className="hover:bg-blue-200 max-[420px]:text-center py-1 px-2 rounded-md w-full"
                required
              >
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
              <Image
                src={file ? URL.createObjectURL(file) : product.image || ImageNotSupported}
                className="rounded-md drop-shadow-6xl m-auto"
                alt={product.name}
                width={100} height={100}
              />
              <label htmlFor="image" className="text-xs absolute max-[420px]:top-1/3 top-2/3 left-0 w-full">
                <span className="bg-blue-500 hover:bg-blue-500 text-white py-1 px-3 rounded-xl shadow-6xl mx-auto w-fit cursor-pointer block">Subir</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  className="bg-white py-1 px-2 rounded-md"
                  onChange={handleChange2}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        </div>
        <button className="text-white bg-blue-500 hover:bg-blue-600 font-bold py-1 px-2 rounded-xl shadow-6xl mx-auto w-fit">
          {params.id ? "Actualizar Producto" : "Crear Producto"}
        </button>
      </form >
    </>
  );
}