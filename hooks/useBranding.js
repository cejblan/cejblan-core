import { useState, useEffect } from "react";

export function useBranding() {
  const [logo, setLogo] = useState(null);
  const [logo2, setLogo2] = useState(null);
  const [logo3, setLogo3] = useState(null);
  const [fondo, setFondo] = useState(null);
  const [img404, setImg404] = useState(null);
  const [img500, setImg500] = useState(null);
  const [palette, setPalette] = useState([]);
  const [navbar, setNavbar] = useState(null);
  const [footer, setFooter] = useState(null);
  const [loadingStyle, setLoadingStyle] = useState(null);
  const [background, setBackground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchBranding() {
      try {
        const res = await fetch("/api/branding");
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;

        if (typeof data.logo === "string") setLogo(data.logo);
        if (typeof data.logo2 === "string") setLogo2(data.logo2);
        if (typeof data.logo3 === "string") setLogo3(data.logo3);
        if (typeof data.fondo === "string") setFondo(data.fondo);
        if (typeof data.img404 === "string") setImg404(data.img404);
        if (typeof data.img500 === "string") setImg500(data.img500);
        if (Array.isArray(data.palette)) setPalette(data.palette);
        if (typeof data.navbar === "string") setNavbar(data.navbar);
        if (typeof data.footer === "string") setFooter(data.footer);
        if (typeof data.loading === "string") setLoadingStyle(data.loading);
        if (typeof data.background === "string") setBackground(data.background);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error al cargar configuración de branding:", err);
        setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBranding();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    logo,
    logo2,
    logo3,
    fondo,
    img404,
    img500,
    palette,
    navbar,
    footer,
    loadingStyle,
    loading,
    background,
    error
  };
}
