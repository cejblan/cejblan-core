import Client404 from './components/Client404';

export const metadata = {
  title: "Error 404 - Cejblan",
  description: "Página de error 404 (Not Found).",
  openGraph: {
    title: "Error 404 - Cejblan",
    description: "Página de error 404 (Not Found).",
    url: "https://www.cejblan-cms.vercel.com/not-found",
    images: [
      { url: "https://www.cejblan-cms.vercel.com/Gato404.webp" }
    ],
  },
};

export default function NotFound() {
  return <Client404 />;
}
