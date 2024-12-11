import Image from "next/image"
import Link from "next/link"
import Logo from "public/logo_cejblan.webp"
import DoNotShow from "./DoNotShow";

export default function Navbar() {
    return (
        <DoNotShow>
            <nav id="cejblan" className="grid grid-cols-5 gap-2 bg-blue-600 text-white text-xl font-semibold max-h-6 sm:px-12 lg:px-20 shadow-3xl mb-4 h-9 w-full z-20 fixed" role="navigation">
                <Link href="https://www.instagram.com/cejblan/" className="col-start-1 col-end-1 bg-orange-500 rounded-b-2xl h-4 shadow-3xl" target="_blank">
                    <p>Instagram</p>
                </Link>
                <Link href="https://www.linkedin.com/in/francisco-gonzalez-449a98154/" className="col-start-2 col-end-2 bg-orange-500 rounded-b-2xl h-4 shadow-3xl" target="_blank">
                    <p>Linkedin</p>
                </Link>
                <div className="block m-auto pt-1">
                    <Link href="/" className="col-start-3 col-end-3">
                        <Image className="m-auto" src={Logo} alt="Logo Cejblan" width={81} height={81} />
                    </Link>
                </div>
                <Link href="https://github.com/cejblan" className="col-start-4 col-end-4 bg-orange-500 rounded-b-2xl h-4 shadow-3xl" target="_blank">
                    <p>GitHub</p>
                </Link>
                <Link href="https://codepen.io/Francisco-Gonzalez-cejblan" className="col-start-5 col-end-5 bg-orange-500 rounded-b-2xl h-4 shadow-3xl" target="_blank">
                    <p>Codepen</p>
                </Link>
            </nav>
            <div className="h-12" />
        </DoNotShow>
    );
}
