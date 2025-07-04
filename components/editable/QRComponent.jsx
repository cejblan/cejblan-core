"use client"

import React, { useState } from "react";
import QRCode from "react-qr-code";

export default function QRComponent() {
  const [texto, setTexto] = useState("");

  const handleChange = (e) => {
    setTexto(e.target.value);
  };

  return (
    // ===START_RETURN===
    <section className="text-center p-8">
      <QRCode value={texto} className="mb-2 mx-auto" />
      <div className="px-8 mb-1">
        <label htmlFor="texto" className="text-4xl font-bold pr-1 mb-1 block">
          Generar QR:
        </label>
        <input
          name="texto"
          id="texto"
          type="text"
          placeholder="Escribe lo que quieres generar"
          value={texto}
          onChange={handleChange}
          className="bg-slate-200 text-center text-black py-1 px-2 rounded-md w-full"
        />
      </div>
    </section>
    // ===END_RETURN===
  )
}