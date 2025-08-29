import Link from "next/link";
import Image from "next/image";
import ImageNotSupported from "public/ImageNotSupported.webp"

export default function ProductCardAdmin({ product }) {
  const paddedId = String(product.id).padStart(4, '0');

  return (
    product.quantity === "0" ?
      <Link className="bg-white opacity-60 hover:bg-slate-100 text-center text-black text-base tracking-normal leading-4 shadow-6xl rounded-xl p-1 z-10"
        href={`/admin/products/${product.id}`}
      >
        <div key={product.id} className="relative">
          <h3 className="font-medium absolute right-0">{paddedId}</h3>
          <Image src={product.image || ImageNotSupported} alt="Product 1" className="max-[420px]:min-w-10 min-w-12 max-[420px]:max-w-10 max-w-12 max-[420px]:min-h-10 min-h-12 max-[420px]:max-h-10 max-h-12 object-scale-down rounded-xl shadow-xl m-auto mb-1" width={100} height={100} />
          <div>
            <h3>{product.name}</h3>
          </div>
        </div>
      </Link>
      :
      <Link className="bg-white hover:bg-slate-100 text-center text-black text-base tracking-normal leading-4 shadow-6xl rounded-xl p-1 z-10"
        href={`/admin/products/${product.id}`}
      >
        <div key={product.id} className="relative">
          <h3 className="font-medium absolute right-0">{paddedId}</h3>
          <Image src={product.image || ImageNotSupported} alt="Product 1" className="max-[420px]:min-w-10 min-w-12 max-[420px]:max-w-10 max-w-12 max-[420px]:min-h-10 min-h-12 max-[420px]:max-h-10 max-h-12 object-scale-down rounded-xl shadow-xl m-auto mb-1" width={100} height={100} />
          <div>
            <h3>{product.name}</h3>
          </div>
        </div>
      </Link>
  );
}
