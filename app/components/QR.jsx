"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import { BsQrCode } from "react-icons/bs";

export default function QR(product) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    product.quantity === "0" ?
      <>
        <button className="bg-blue-700 hover:bg-blue-500 text-white absolute right-1 top-1 p-1 rounded-xl z-20">
          <BsQrCode />
        </button><div>
          <div className={`m-auto justify-center flex ${isOpen ? "" : "hidden"}`}>
            <QRCode value={`https://www.cejblan.com/products/${product.id}`} className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 z-10" />
          </div>
          <div className={`m-auto justify-center flex ${isOpen ? "hidden" : ""}`}>
            {product.image &&
              <Image src={product.image} className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 w-auto h-auto rounded-xl object-scale-down" alt={product.name} width={100} height={100} />}
          </div>
        </div>
      </>
      :
      <>
        <button className="bg-blue-700 hover:bg-blue-500 text-white absolute right-1 top-1 p-1 rounded-xl z-20" onClick={handleClick}>
          <BsQrCode />
        </button>
        <Link href={`/products/${product.id}`}>
          <div className={`m-auto justify-center flex ${isOpen ? "" : "hidden"}`}>
            <QRCode value={`https://www.cejblan.com/products/${product.id}`} className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 z-10" />
          </div>
          <div className={`m-auto justify-center flex ${isOpen ? "hidden" : ""}`}>
            {product.image &&
              <Image src={product.image} className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 w-auto h-auto rounded-xl object-scale-down" alt={product.name} width={100} height={100} />
            }
          </div>
        </Link>
      </>
  )
}
