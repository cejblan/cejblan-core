import ProfileComponent from "../components/ProfileComponent";

export const metadata = {
  title: "Perfil - Cejblan",
  description: "Página del perfil de los usuarios (profile).",
  openGraph: {
    title: "Perfil - Cejblan",
    description: "Página del perfil de los usuarios (profile).",
    url: "https://www.cejblan-cms.vercel.app/profile",
  },
};

export default function ProfilePage() {

  return (
    <ProfileComponent />
  )
}