import Login from "@/components/pages/Login";

export const metadata = {
  title: "Login - " + process.env.NEXT_PUBLIC_SITE_NAME,
  description: "Página de inicio de sesión (login).",
  openGraph: {
    title: "Login - " + process.env.NEXT_PUBLIC_SITE_NAME,
    description: "Página de inicio de sesión (login).",
    url: "https://www.cejblan-cms.vercel.app/login",
  },
};

export default function LoginPage() {

  return (
    <Login />
  );
};