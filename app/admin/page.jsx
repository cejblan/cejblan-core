"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaTelegram } from "react-icons/fa";
import Countdown from "@/components/Countdown";
import { useEffect, useState } from "react";
import { FaTools } from "react-icons/fa";
import { FaHeartCircleCheck } from "react-icons/fa6";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [dataProfile, setData] = useState([{ verified: 1 }]);
  const [code, setCode] = useState(null);
  const [initialTime, setInitialTime] = useState(null);

  // Estado para Cejblan Update System
  const [updateInfo, setUpdateInfo] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.email) return;
      const res = await fetch(`/api/profile?customerEmail=${encodeURIComponent(session.user.email)}`);
      const json = await res.json();
      setData(json);
    }
    fetchProfile();
  }, [session]);

  // Verifica actualizaciones disponibles
  async function checkUpdates() {
    try {
      const res = await fetch("/api/versions/update");
      const data = await res.json();
      setUpdateInfo(data);
    } catch (error) {
      console.error("Error verificando actualizaciones:", error);
    }
  }

  // Instala la actualización desde GitHub
  async function installUpdate() {
    setLoadingUpdate(true);
    try {
      const resGit = await fetch("/api/versions/update-to-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipUrl: updateInfo.zipUrl, // ← asegurarse que viene del checkUpdates()
          commitMessage: `Actualización desde CMS a ${updateInfo.latestVersion}`,
          description: updateInfo.changelog || ""
        }),
      });

      const resultGit = await resGit.json();
      alert(resultGit.message || "Actualización enviada a GitHub");
      checkUpdates();
    } catch (err) {
      console.error("Error enviando cambios a GitHub:", err);
    } finally {
      setLoadingUpdate(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && dataProfile[0]?.verified === 1) {
      checkUpdates();
    }
  }, [status, dataProfile]);

  async function codeVerified() {
    const aleatorio = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
    setCode(aleatorio);
    try {
      const res = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, code: aleatorio }),
      });
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
        {updateInfo ? (
          <div>
            <p className="max-[420px]:text-xl text-2xl font-semibold">
              Versión actual: <span className="font-bold">{updateInfo.currentVersion}</span>
            </p>
            <p className="max-[420px]:text-sm text-lg font-semibold">
            Instalada: <span className="font-bold">
                {new Date(updateInfo.currentDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Cargando versión...</p>
        )}
      </div>

      {/* Sección de Cejblan Update System */}
      {updateInfo && (
        <div className="bg-white text-slate-800 max-[420px]:p-2 p-4 mb-4 rounded-xl">
          <div className="max-[420px]:text-2xl text-4xl font-bold mb-3 flex gap-2">
            <FaTools className="ml-auto my-auto" />
            <h2 className="mr-auto">Cejblan Update System</h2>
          </div>
          <p className="max-[420px]:text-xl text-2xl font-semibold">
            Última versión: <span className="font-bold">{updateInfo.latestVersion}</span>
          </p>
          <p className="max-[420px]:text-sm text-lg font-semibold">
            Publicada: <span className="font-bold">
              {new Date(updateInfo.latestDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </p>
          <p className="text-base mt-2 text-gray-600">{updateInfo.changelog}</p>

          {updateInfo.hasUpdate ? (
            <button
              onClick={installUpdate}
              disabled={loadingUpdate}
              className={`mt-4 py-2 px-4 rounded-xl shadow-lg text-white font-bold transition-colors ${loadingUpdate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#6ed8bf] hover:bg-[#4bb199]"
                }`}
            >
              {loadingUpdate ? "Actualizando..." : "Actualizar ahora"}
            </button>
          ) : (
            <div className="mt-2 text-green-600 font-bold flex gap-2">
              <FaHeartCircleCheck className="ml-auto my-auto" />
              <p className="mr-auto">El sistema está actualizado</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}