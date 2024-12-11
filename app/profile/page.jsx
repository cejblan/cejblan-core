import ProfileComponent from "../components/ProfileComponent";

export const metadata = {
  title: "Perfil - Adriliciaus",
  description: "Página del perfil de los usuarios (profile).",
  openGraph: {
    title: "Perfil - Adriliciaus",
    description: "Página del perfil de los usuarios (profile).",
    url: "https://www.cejblan.com/adriliciaus/profile",
  },
};

export default function ProfilePage() {

  return (
    <ProfileComponent />
  )
}