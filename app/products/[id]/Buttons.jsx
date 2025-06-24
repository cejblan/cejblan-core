"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaCartShopping } from "react-icons/fa6";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { RiSubtractFill, RiAddFill } from "react-icons/ri";
import { CheckWish } from "@/app/components/CheckWish";
import { HandleWish1 } from "@/app/components/WishButton1";
import { HandleWish2 } from "@/app/components/WishButton2";

export default function Buttons(product) {
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const form = useRef(null);
  const router = useRouter();
  const [data, setData] = useState({ quantity: 1 });

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

  const incrementValue = () => {
    if (Number(data.quantity) < product.product.quantity) {
      setData({
        ...data,
        quantity: Number(data.quantity) + 1,
      });
    }
  };

  const decrementValue = () => {
    setData({
      ...data,
      quantity: Math.max(1, Number(data.quantity) - 1),
    });
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", product.product.id);
    formData.append("name", product.product.name);
    formData.append("quantity", data.quantity || 1);
    formData.append("price", product.product.price);
    formData.append("iva", product.product.iva);
    formData.append("customer", session.user.email);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al agregar producto al carrito");

      alert("Agregado en el carrito");
      form.current.reset();
      router.push("/products");
    } catch (error) {
      console.error("Error al manejar el carrito:", error);
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleAddWish = (e) => {
    HandleWish1({ e, data: product.product, session, onRefresh: handleRefresh });
    setIsInWishlist(true);
  };

  const handleRemoveWish = (e) => {
    HandleWish2({ e, data: product.product, session, onRefresh: handleRefresh });
    setIsInWishlist(false);
  };

  if (product.product.quantity === "0") {
    alert("No hay existencia disponible de este producto");
    router.push("/products");
  } else if (data.quantity > product.product.quantity) {
    alert("No puedes superar el máximo de existencia");
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
          className="text-white bg-blue-700 hover:bg-blue-900 font-bold py-1 px-2 rounded-xl shadow-6xl flex justify-center items-start"
        >
          <p className="max-[420px]:text-sm md:text-lg flex justify-center items-center">
            Agregar<FaCartShopping className="ml-1" />
          </p>
        </button>
      </form>

      <form className="flex gap-x-1 items-center" ref={form}
        onSubmit={(e) => isInWishlist
          ? handleRemoveWish(e)
          : handleAddWish(e)
        }>
        <button
          className="text-white bg-pink-700 hover:bg-pink-900 max-[420px]:text-lg text-3xl font-bold p-1 rounded-xl shadow-6xl"
        >
          {isInWishlist ? <IoIosHeart /> : <IoIosHeartEmpty />}
        </button>
      </form>
    </div>
  );
}