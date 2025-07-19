"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import { BsQrCode } from "react-icons/bs";
import ImageNotSupported from "public/ImageNotSupported.webp"

export default function QR({ id, name, image, quantity }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    quantity === "0" ?
      <>
        <button className="bg-blue-500 hover:bg-blue-500 text-white absolute right-1 top-1 p-1 rounded-xl z-20">
          <BsQrCode />
        </button><div>
          <div className={`m-auto justify-center flex ${isOpen ? "" : "hidden"}`}>
            <QRCode value={`${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}`} className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 z-10" />
          </div>
          <div className={`m-auto justify-center flex ${isOpen ? "hidden" : ""}`}>
            <Image
              src={image || ImageNotSupported}
              className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 w-auto h-auto rounded-xl object-scale-down"
              alt={name || "Imagen no disponible"}
              width={100}
              height={100}
            />
          </div>
        </div>
      </>
      :
      <>
        <button className="bg-blue-500 hover:bg-blue-500 text-white absolute right-1 top-1 p-1 rounded-xl z-20" onClick={handleClick}>
          <BsQrCode />
        </button>
        <Link href={`/products/${id}`}>
          <div className={`m-auto justify-center flex ${isOpen ? "" : "hidden"}`}>
            <QRCode value={`${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}`} className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 z-10" />
          </div>
          <div className={`m-auto justify-center flex ${isOpen ? "hidden" : ""}`}>
            <Image
              src={image || ImageNotSupported}
              className="max-[420px]:min-w-12 min-w-14 max-[420px]:max-w-12 max-w-14 max-[420px]:min-h-12 min-h-14 max-[420px]:max-h-12 max-h-14 w-auto h-auto rounded-xl object-scale-down"
              alt={name || "Imagen no disponible"}
              width={100}
              height={100}
            />
          </div>
        </Link>
      </>
  )
}
