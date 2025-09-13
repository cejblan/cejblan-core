"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image"
import Link from "next/link"
import React from "react"
import branding from "@/config/themes.json";
import Loading1 from "@/components/editable/Loading1";
import Loading2 from "@/components/editable/Loading2";
import Loading3 from "@/components/editable/Loading3";

function getLoadingComponent(name) {
  switch (name) {
    case "loading1":
      return Loading1;
    case "loading2":
      return Loading2;
    case "loading3":
      return Loading3;
    default:
      return Loading1;
  }
}

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const { loading, logo, logo2 } = branding

  const Loading = getLoadingComponent(loading);

  if (session) {
    router.push("/");
    return (
      <Loading zIndex={50} />
    );
  }
  
  return (
    // ===START_RETURN===
    <div className="py-8">
      <div className="bg-white shadow-md rounded-xl pt-4 pb-3 px-4 mx-auto grid grid-cols-1 w-fit">
        <Link href={process.env.NEXT_PUBLIC_SITE_URL} className="mb-2">
          <Image
            className="rounded-full shadow-6xl m-auto"
            src={logo}
            alt={`Desarrollado por ${process.env.NEXT_PUBLIC_SITE_NAME}`}
            width={100}
            height={100} />
          <Image
            className="drop-shadow-xl m-auto"
            src={logo2}
            alt={`Desarrollado por ${process.env.NEXT_PUBLIC_SITE_NAME}`}
            width={100}
            height={100} />
        </Link>
        <p className="leading-tight mb-2">Por favor, inicia sesión con tu<br />cuenta de Google para continuar.</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-slate-100 hover:bg-slate-300 text-xl text-center transition-all duration-200 border border-slate-400 py-1 px-2 mb-2 w-full rounded-xl flex gap-1 justify-center items-center"
        >
          <Image
            loading="lazy"
            id="logo-google"
            src="https://authjs.dev/img/providers/google.svg"
            alt="logo-google"
            width={24}
            height={24}
          />
          <span>Iniciar sesión con Google</span>
        </button>
        <Link
          href="/"
          className="text-slate-600 hover:text-slate-900 mx-auto w-fit"
        >
          ← Volver al Inicio
        </Link>
      </div>
    </div >
    // ===END_RETURN===
  )
}