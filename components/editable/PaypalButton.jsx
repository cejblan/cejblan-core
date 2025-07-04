import { RiPaypalFill } from "react-icons/ri";

export default function PaypalButton() {

  return (
    // ===START_RETURN===
      <div id="paypalButton" className="lg:w-8 max-[420px]:w-6 lg:h-8 max-[420px]:h-6 rounded-full z-40 fixed">
        <a href="https://www.paypal.com/ncp/payment/SBGP7VBEAHDVE" target="_blank">
          <RiPaypalFill className="w-full h-full py-1 m-auto" />
        </a>
      </div>
    // ===END_RETURN===
  )
}