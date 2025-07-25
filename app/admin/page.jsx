"use client"

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaTelegram } from "react-icons/fa";
import Countdown from "@/components/Countdown";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [dataProfile, setData] = useState([{ verified: 1 }]);
  const [code, setCode] = useState(null);
  const [initialTime, setInitialTime] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.email) return;
      const res = await fetch(`/api/profile?customerEmail=${encodeURIComponent(session.user.email)}`);
      const json = await res.json();
      setData(json);
    }
    fetchProfile();
  }, [session]);

  async function codeVerified() {
    const aleatorio = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
    setCode(aleatorio);
    try {
      const res = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, code: aleatorio }),
      });
      const json = await res.json();
      if (res.ok) setInitialTime(59);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  if (status === "authenticated" && dataProfile[0]?.verified === 0) {
    return (
      <div className="bg-white text-slate-800 max-[420px]:p-2 p-4 mb-4 rounded-xl">
        <h1 className="text-2xl font-bold text-center">Necesitamos enlazar tu perfil con nuestro bot de Telegram</h1>
        <div className="text-center mt-4 grid grid-cols-1 gap-3 justify-center items-center">
          <div>
            <p className="text-xl font-medium flex justify-center items-center gap-2">
              Bot de <span className="text-blue-600 font-bold">Telegram</span> <FaTelegram className="text-blue-600 h-5 w-5" />
            </p>
            <Link
              href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_NAME}`}
              target="_blank"
              className="text-xl text-blue-600 hover:text-blue-500 underline"
            >
              @{process.env.NEXT_PUBLIC_BOT_NAME}
            </Link>
          </div>
          {code ? (
            <div>
              <p className="bg-blue-600 text-3xl text-white text-center font-bold px-4 py-1 rounded-xl shadow-lg mx-auto w-fit">
                {code}
              </p>
              {initialTime && (
                <Countdown
                  initialTime={initialTime}
                  onTimeUp={() => setCode(null)}
                />
              )}
            </div>
          ) : (
            <button
              onClick={codeVerified}
              className="bg-[#6ed8bf] hover:bg-[#4bb199] text-white py-2 px-4 rounded-xl shadow-lg mx-auto block"
            >
              Generar Código
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white text-slate-800 max-[420px]:p-2 p-4 mb-4 rounded-xl">
        <h1 className="max-[420px]:text-2xl text-5xl font-bold">¡Bienvenido a CejBlan!</h1>
        <p className="max-[420px]:text-xl text-2xl font-semibold">Versión: 1.0.0</p>
      </div>
    </>
  );
}