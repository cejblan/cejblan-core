import { useState, useEffect } from "react";

export function useBranding() {
  const [logo, setLogo] = useState(null);
  const [palette, setPalette] = useState([]);
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
        if (Array.isArray(data.palette)) setPalette(data.palette);
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

  return { logo, palette, loading, error };
}
