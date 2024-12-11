import LoginComponent from "../components/LoginComponent";

export const metadata = {
  title: "Login - Adriliciaus",
  description: "Página de inicio de sesión (login).",
  openGraph: {
    title: "Login - Adriliciaus",
    description: "Página de inicio de sesión (login).",
    url: "https://www.cejblan.com/adriliciaus/login",
  },
};

export default function LoginPage() {

  return (
    <LoginComponent />
  );
};