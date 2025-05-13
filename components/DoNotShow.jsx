"use client"

import { usePathname } from "next/navigation";

export default function DoNotShow({ children }) {
    const pathname = usePathname();
    const cejblanPattern = /\/?/;
    const isCejblanPage = cejblanPattern.test(pathname);
    const suspirosPattern = /\/suspirosyponkes\/?/;
    const isSuspirosPage = suspirosPattern.test(pathname);

    if (isCejblanPage || isSuspirosPage) {
        return null; // Renderiza nada en páginas de "cejblan"
    } else {
        return children; // Renderiza los hijos en otras rutas
    }
}
