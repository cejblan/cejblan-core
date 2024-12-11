import Link from "next/link"
import DoNotShow from "./DoNotShow";

export default function Sidebar() {
    return (
        <DoNotShow>
            <sidebar>
                <section id="fondo" className="bg-black bg-opacity-60 w-full z-50 fixed"></section>
                <div id="sidebar" className="p-1 pr-4 z-50 bg-orange-500 text-white text-justify rounded-r-2xl shadow-5xl hover:shadow-7xl fixed">
                    <ul className="py-1 px-2 my-1">
                        <Link href="/" className="bg-blue-600 p-1 rounded-xl shadow-6xl">
                            <p>Página Principal</p>
                        </Link>
                    </ul>
                    <ul className="py-1 px-2 my-1">
                        <Link href="/tablaPeriodica" className="bg-blue-600 p-1 rounded-xl shadow-6xl">
                            <p>Tabla Periodica Interactiva</p>
                        </Link>
                    </ul>
                    <ul className="py-1 px-2 my-1">
                        <Link href="/contadorCaracteres" className="bg-blue-600 p-1 rounded-xl shadow-6xl">
                            <p>Contador de Caracteres</p>
                        </Link>
                    </ul>
                    <ul className="py-1 px-2 my-1">
                        <Link href="/emojis" className="bg-blue-600 p-1 rounded-xl shadow-6xl">
                            <p>Lista de Emojis en PC</p>
                        </Link>
                    </ul>
                    <ul className="py-1 px-2 my-1">
                        <Link href="/qr" className="bg-blue-600 p-1 rounded-xl shadow-6xl">
                            <p>Generador QR</p>
                        </Link>
                    </ul>
                </div>
            </sidebar>
        </DoNotShow>
    );
}
