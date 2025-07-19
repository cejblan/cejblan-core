import Error404 from '@/components/pages/Not-found';

export const metadata = {
  title: `Error 404 - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Página de error 404 (Not Found).",
  openGraph: {
    title: `Error 404 - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Página de error 404 (Not Found).",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/not-found`,
  },
};

export default function NotFound() {
  return <Error404 />;
}
