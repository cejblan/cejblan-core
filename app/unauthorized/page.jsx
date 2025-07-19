import Unauthorized from "@/components/pages/Unauthorized";

export const metadata = {
  title: `No Autorizado - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Página de acceso no autorizado (unauthorized).",
  openGraph: {
    title: `No Autorizado - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Página de acceso no autorizado (unauthorized).",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/unauthorized`,
  },
};

export default function UnauthorizedPage() {
  return (
    <Unauthorized />
  )
}