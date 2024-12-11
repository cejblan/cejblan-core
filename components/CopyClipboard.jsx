"use client"

import React, { useState } from "react";
import ClipboardCopy from "clipboard-copy";

const Modal = () => {
  return (
    <p id="modal" className="text-2xl py-1 px-2 rounded-2xl bg-blue-600 text-white fixed top-12">¡Copiado!</p>
  );
};

const CopyToClipboardButton = ({ text }) => {
  const [showModal, setShowModal] = useState(false);

  const handleCopyClick = async () => {
    try {
      await ClipboardCopy(text);
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000); // Oculta el modal después de 3 segundos
    } catch (error) {
      console.error("Error al copiar al portapapeles", error);
    }
  };

  return (
    <>
      <button onClick={handleCopyClick}>{text}</button>
      {showModal && <Modal />}
    </>
  );
};

export default CopyToClipboardButton;
