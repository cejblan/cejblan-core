"use client"

import { usePathname } from "next/navigation";

export default function DoNotShow({ children }) {
    const pathname = usePathname();
    const adriliciausPattern = /\/adriliciaus\/?/;
    const isAdriliciausPage = adriliciausPattern.test(pathname);
    const suspirosPattern = /\/suspirosyponkes\/?/;
    const isSuspirosPage = suspirosPattern.test(pathname);

    if (isAdriliciausPage || isSuspirosPage) {
        return null; // Renderiza nada en páginas de "adriliciaus"
    } else {
        return children; // Renderiza los hijos en otras rutas
    }
}
