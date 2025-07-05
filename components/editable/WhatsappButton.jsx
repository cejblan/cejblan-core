import Link from "next/link";
import { RiWhatsappLine } from "react-icons/ri";

export default function WhatsappButton() {

  return (
    // ===START_RETURN===
      <div id="whatsappButton" className="bg-green-500 hover:bg-white drop-shadow-6xl lg:w-8 max-[420px]:w-6 lg:h-8 max-[420px]:h-6 rounded-full z-40 fixed bottom-1 right-1">
        <Link href="https://api.whatsapp.com/send?text=Hola,%20informacion%20por%20favor&phone=584142245444" target="_blank">
          <RiWhatsappLine className="text-white hover:text-green-500 w-full h-full py-1 m-auto" />
        </Link>
      </div>
    // ===END_RETURN===
  )
};