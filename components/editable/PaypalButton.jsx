import { RiPaypalFill } from "react-icons/ri";

export default function PaypalButton() {

  return (
    // ===START_RETURN===
      <div id="paypalButton" className="bg-white hover:bg-blue-500 drop-shadow-6xl w-6 h-6 rounded-full z-40 fixed bottom-8 right-1">
        <a href="https://www.paypal.com/ncp/payment/SBGP7VBEAHDVE" target="_blank">
          <RiPaypalFill className="text-blue-500 hover:text-white w-full h-full py-1 m-auto" />
        </a>
      </div>
    // ===END_RETURN===
  )
}