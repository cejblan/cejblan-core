import LoginComponent from "../components/LoginComponent";

export const metadata = {
  title: "Login - Cejblan",
  description: "Página de inicio de sesión (login).",
  openGraph: {
    title: "Login - Cejblan",
    description: "Página de inicio de sesión (login).",
    url: "https://www.cejblan-cms.vercel.app/login",
  },
};

export default function LoginPage() {

  return (
    <LoginComponent />
  );
};