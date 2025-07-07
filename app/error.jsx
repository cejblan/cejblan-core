"use client";

import { useEffect } from "react";
import Error500 from "@/components/pages/Error";

const images = [
  "https://www.cejblan-cms.vercel.app/Gato500.webp",
];

export const metadata = {
  title: "Error 500 - " + process.env.NEXT_PUBLIC_SITE_NAME,
  description: "Página de error 500 y otros.",
  openGraph: {
    title: "Error 500 - " + process.env.NEXT_PUBLIC_SITE_NAME,
    description: "Página de error 500 y otros.",
    url: "https://www.cejblan-cms.vercel.app/error",
    images: images.map((url) => ({ url })),
  },
};

export default function Error({ error, reset }) {

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Error500 />
  );
}