import Link from "next/link";
import Image from "next/image";

export default function ProductCardAdmin({ product }) {
  return (
    product.quantity === "0" ?
      <Link className="bg-white opacity-60 hover:bg-slate-100 text-center text-black text-base tracking-normal leading-4 shadow-6xl rounded-xl p-1 z-10"
        href={`/adriliciaus/admin/products/${product.id}`}
      >
        <div key={product.id}>
          <Image src={product.image} alt="Product 1" className="max-[420px]:min-w-10 min-w-12 max-[420px]:max-w-10 max-w-12 max-[420px]:min-h-10 min-h-12 max-[420px]:max-h-10 max-h-12 object-scale-down rounded-xl shadow-xl m-auto mb-1" width={100} height={100} />
          <div className="text-sm">
            <h3 className="font-medium">{product.name}</h3>
          </div>
        </div>
      </Link>
      :
      <Link className="bg-white hover:bg-slate-100 text-center text-black text-base tracking-normal leading-4 shadow-6xl rounded-xl p-1 z-10"
        href={`/adriliciaus/admin/products/${product.id}`}
      >
        <div key={product.id}>
          <Image src={product.image} alt="Product 1" className="max-[420px]:min-w-10 min-w-12 max-[420px]:max-w-10 max-w-12 max-[420px]:min-h-10 min-h-12 max-[420px]:max-h-10 max-h-12 object-scale-down rounded-xl shadow-xl m-auto mb-1" width={100} height={100} />
          <div className="text-sm">
            <h3 className="font-medium">{product.name}</h3>
          </div>
        </div>
      </Link>
  );
}
