"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaCartShopping } from "react-icons/fa6";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { RiSubtractFill, RiAddFill } from "react-icons/ri";
import { CheckWish } from "@/components/CheckWish";
import { HandleWish1 } from "@/components/WishButton1";
import { HandleWish2 } from "@/components/WishButton2";

export default function Buttons(product) {
  const { data: session } = useSession(); // Obtener la sesión actual del usuario
  const [isInWishlist, setIsInWishlist] = useState(false); // Estado para wishlist
  const form = useRef(null);
  const router = useRouter();
  const [data, setData] = useState({
    quantity: 1,
  });
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: Number(e.target.value), // Convertir a número
    });
  };
  const incrementValue = () => {
    if (Number(data.quantity) < product.product.quantity) {
      setData({
        ...data,
        quantity: Number(data.quantity) + 1, // Incrementa solo si es menor a product.product.quantity
      });
    }
  };
  const decrementValue = () => {
    setData({
      ...data,
      quantity: Math.max(1, Number(data.quantity) - 1), // Convertir cantidad a número
    });
  };

  useEffect(() => {
    if (session?.user?.email) {
      CheckWish(product.product, session, setIsInWishlist);
    }
  }, [product.product, session]);

  useEffect(() => {
    if (!data.quantity) {
      setData(prevProduct => ({
        ...prevProduct,
        quantity: 1,
      }));
    }
  }, [data]);

  let quantity = data.quantity || 1;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", product.product.id);
    formData.append("name", product.product.name);
    formData.append("quantity", quantity);
    formData.append("price", product.product.price);
    formData.append("iva", product.product.iva);
    formData.append("customer", session.user.email);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al agregar producto al carrito");
      }

      const data = await res.json();
      console.log("Producto agregado al carrito");
    } catch (error) {
      console.error("Error al manejar el carrito:", error);
    }

    alert("Agregado en el carrito");
    form.current.reset();
    router.push("/products");
  };

  if (product.product.quantity === "0") {
    alert("No hay existencia disponible de este producto");
    router.push("/products");
  } else if (data.quantity > product.product.quantity) {
    alert("No puedes superar el maximo de existencia");
    router.refresh();
    window.location.reload();
  }

  return (
    <div className="flex gap-x-2 justify-end items-center mt-2">
      <form
        className="flex gap-x-1 items-center"
        onSubmit={handleSubmit}
        ref={form}
      >
        <span onClick={decrementValue} className="text-white bg-slate-500 hover:bg-slate-700 text-2xl font-bold rounded-xl h-min cursor-pointer">
          <RiSubtractFill />
        </span>
        <input
          name="quantity"
          type="number"
          placeholder="1"
          onChange={handleChange}
          value={data.quantity || 1}
          min="1"
          max={product.product.quantity}
          className="add shadow font-bold text-white text-center max-[420px]:text-sm md:text-lg bg-slate-400 appearance-none border border-slate-500 rounded-xl w-6 p-1 hover:bg-slate-500"
          required
        />
        <span onClick={incrementValue} className="text-white bg-slate-500 hover:bg-slate-700 text-2xl font-bold rounded-xl h-min cursor-pointer">
          <RiAddFill />
        </span>
        <button
          className="text-white bg-blue-500 hover:bg-blue-600 font-bold py-1 px-2 rounded-xl shadow-6xl flex justify-center items-start"
        >
          <p className="max-[420px]:text-sm md:text-lg flex justify-center items-center">
            Agregar<FaCartShopping className="ml-1" />
          </p>
        </button>
      </form>
      {isInWishlist ?
        <form
          className="flex gap-x-1 items-center"
          onSubmit={(e) => HandleWish2(e, product.product, session, form) + CheckWish(product.product, session, setIsInWishlist)}
          ref={form}
        >
          <button
            className="text-white bg-[#64ffda] hover:bg-[#6ed8bf] max-[420px]:text-lg text-3xl font-bold p-1 rounded-xl shadow-6xl"
          >
            <IoIosHeart />
          </button>
        </form>
        :
        <form
          className="flex gap-x-1 items-center"
          onSubmit={(e) => HandleWish1(e, product.product, session, form) + CheckWish(product.product, session, setIsInWishlist)}
          ref={form}
        >
          <button
            className="text-white bg-[#64ffda] hover:bg-[#6ed8bf] max-[420px]:text-lg text-3xl font-bold p-1 rounded-xl shadow-6xl"
          >
            <IoIosHeartEmpty />
          </button>
        </form>
      }
    </div>
  );
}