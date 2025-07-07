import Error404 from '@/components/pages/Not-found';

export const metadata = {
  title: "Error 404 - Cejblan",
  description: "Página de error 404 (Not Found).",
  openGraph: {
    title: "Error 404 - Cejblan",
    description: "Página de error 404 (Not Found).",
    url: "https://www.cejblan-cms.vercel.app/not-found",
    images: [
      { url: "https://www.cejblan-cms.vercel.app/Gato404.webp" }
    ],
  },
};

export default function NotFound() {
  return <Error404 />;
}
