import ProfileComponent from "@/components/pages/Profile";

export const metadata = {
  title: `Perfil - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: "Página del perfil de los usuarios (profile).",
  openGraph: {
    title: `Perfil - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Página del perfil de los usuarios (profile).",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
  },
};

export default function ProfilePage() {

  return (
    <ProfileComponent />
  )
}