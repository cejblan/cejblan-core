"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

export default function PluginPage() {
  const params = useParams();
  // params.slug puede ser ['mi-plugin'] o ['plugins','mi-plugin']
  const segments = Array.isArray(params.slug) ? params.slug : [params.slug];
  const pluginSlug =
    segments[0] === "plugins" && segments.length > 1 ? segments[1] : segments[0];

  if (!pluginSlug) {
    return notFound();
  }

  // Desde app/admin/[...slug]/page.jsx, plugins está en ../plugins
  const PluginComponent = dynamic(
    () =>
      import(`../plugins/${pluginSlug}/page.jsx`).catch(() => {
        notFound();
      }),
    {
      loading: () => <div>Cargando plugin…</div>,
      ssr: false,
    }
  );

  return (
    <>
      <PluginComponent />
    </>
  );
}
