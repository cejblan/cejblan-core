'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiWhatsappLine } from "react-icons/ri";

export default function WhatsappButton() {
  const [phone, setPhone] = useState(null);

  useEffect(() => {
    async function fetchPhone() {
      try {
        const res = await fetch("/api/admin/settings/whatsapp");
        const data = await res.json();
        setPhone(data.value);
      } catch (error) {
        console.error("Error al cargar número de WhatsApp:", error);
      }
    }
    fetchPhone();
  }, []);

  if (!phone) return null; // no renderiza hasta que tenga el número

  return (
    // ===START_RETURN===
    <div
      id="whatsappButton"
      className="bg-green-500 hover:bg-white drop-shadow-6xl w-6 h-6 rounded-full z-40 fixed bottom-1 right-1"
    >
      <Link
        href={`https://api.whatsapp.com/send?text=Hola,%20informacion%20por%20favor&phone=${phone}`}
        target="_blank"
      >
        <RiWhatsappLine className="text-white hover:text-green-500 w-full h-full py-1 m-auto" />
      </Link>
    </div>
    // ===END_RETURN===
  );
}