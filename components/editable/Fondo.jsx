"use client";

import React from "react";
import { useBranding } from "@/hooks/useBranding";

export default function Fondo({ children }) {
  const { palette, fondo, loading, background } = useBranding();

  if (loading) return null;

  // Definimos el estilo dinámico de forma clara
  let sectionStyle = {};

  if (background === "none") {
    sectionStyle = { backgroundColor: palette?.[8] || "#ffffff" };
  } else if (background === "all") {
    sectionStyle = { backgroundImage: `url(${fondo})` };
  } else if (background === "home") {
    sectionStyle = {}; // aquí decides qué aplicar, vacío no da error
  }

  return (
    // ===START_RETURN===
    <section className="bg-cover bg-center" style={sectionStyle}>
      {children}
    </section>
    // ===END_RETURN===
  );
}
