"use client"

import React, { useEffect, useState, useRef } from "react";

export default function ContadorCaracteresComponent() {
  const [guardado, setGuardado] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.addEventListener("input", (event) => {
        setGuardado(event.target.value);
      });
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", (event) => {
          setGuardado(event.target.value);
        });
      }
    };
  }, []);

  return (
    <div className="flex my-4 max-w-84">
      <textarea className="h-84 w-84 border-2 border-solid border-black rounded p-1 m-auto" ref={textareaRef} name="areaUno" id="areaUno" placeholder="Escribe aquí"></textarea>
      <div className="text-3xl h-84 w-84 border-2 border-solid border-black rounded py-24 m-auto">El texto tiene:<br></br>{guardado.length} Caracteres</div>
    </div>
  )
}