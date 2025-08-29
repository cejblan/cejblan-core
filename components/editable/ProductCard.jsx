"use client";

import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import QR from "../QR";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { CheckWish } from "../CheckWish";
import { HandleWish1 } from "../WishButton1";
import { HandleWish2 } from "../WishButton2";
import EliminarCaracteres from "../EliminarCaracteres";

export default function ProductCard({ product }) {
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false); // Estado para wishlist
  const form = useRef(null);

  function iconHeart() {
    if (isInWishlist) {
      setIsInWishlist(false);
    } else if (!isInWishlist) {
      setIsInWishlist(true);
    };
  };

  useEffect(() => {
    if (session?.user?.email) {
      CheckWish(product, session, setIsInWishlist);
    }
  }, [product, session]);

  return (
    // ===START_RETURN===
    product.quantity == 0 ?
      <div className="bg-white opacity-60 hover:bg-gray-300 text-start text-slate-900 text-base relative grid grid-cols-3 justify-center items-center shadow-sm rounded-2xl py-1 pl-1 pr-2 z-10">
        <QR id={product.id} name={product.name} image={product.image} />
        <div className="col-start-2 col-end-4">
          <div>
            <div className="flex">
              <h1 className="flex-1 leading-6 min-h-7">{product.name}</h1>
              <h2 className="text-slate-700 font-bold mt-4">
                ${product.price}
              </h2>
            </div>
            <p className="text-slate-600 text-base px-2 min-h-7">
              {EliminarCaracteres(product.description).slice(0, 30)}...
            </p>
          </div>
        </div>
        {isInWishlist ?
          <form
            className="flex gap-x-1 items-center"
            onSubmit={(e) => {
              HandleWish2(e, product, session, form);
              iconHeart();
            }}
            ref={form}
          >
            <button className="text-[#6ed8bf] text-3xl cursor-pointer absolute right-1 bottom-1 h-4 w-4 flex justify-center items-center">
              <IoIosHeart />
            </button>
          </form>
          :
          <form
            className="flex gap-x-1 items-center"
            onSubmit={(e) => {
              HandleWish1(e, product, session, form);
              iconHeart();
            }}
            ref={form}
          >
            <button className="text-[#6ed8bf] text-3xl cursor-pointer absolute right-1 bottom-1 h-4 w-4 flex justify-center items-center">
              <IoIosHeartEmpty />
            </button>
          </form>
        }
      </div>
      :
      <div className="bg-white hover:bg-gray-300 text-start text-slate-900 text-base relative grid grid-cols-3 justify-center items-center shadow-sm rounded-2xl py-1 pl-1 pr-2 z-10">
        <QR id={product.id} name={product.name} image={product.image} />
        <Link href={`/products/${product.id}`} className="col-start-2 col-end-4">
          <div>
            <div className="flex">
              <h1 className="flex-1 leading-6 min-h-7">{product.name}</h1>
              <h2 className="text-slate-700 font-bold mt-4">
                ${product.price}
              </h2>
            </div>
            <p className="text-slate-600 text-base px-2 min-h-7">
              {EliminarCaracteres(product.description).slice(0, 30)}...
            </p>
          </div>
        </Link>
        {isInWishlist ?
          <form
            className="flex gap-x-1 items-center"
            onSubmit={(e) => {
              HandleWish2(e, product, session, form);
              iconHeart();
            }}
            ref={form}
          >
            <button className="text-[#6ed8bf] text-3xl cursor-pointer absolute right-1 bottom-1 h-4 w-4 flex justify-center items-center">
              <IoIosHeart />
            </button>
          </form>
          :
          <form
            className="flex gap-x-1 items-center"
            onSubmit={(e) => {
              HandleWish1(e, product, session, form);
              iconHeart();
            }}
            ref={form}
          >
            <button className="text-[#6ed8bf] text-3xl cursor-pointer absolute right-1 bottom-1 h-4 w-4 flex justify-center items-center">
              <IoIosHeartEmpty />
            </button>
          </form>
        }
      </div>
    // ===END_RETURN===
  );
}