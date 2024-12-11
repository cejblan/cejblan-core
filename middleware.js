import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth(async function middleware(req) {
  const { pathname } = req.nextUrl;
  // Solo aplicamos la validación en las rutas de admin
  if (pathname.startsWith("/adriliciaus/admin")) {
    const token = await getToken({ req });
    if (!token.admin) {
      // El usuario no es admin, redirige a una página de acceso denegado
      return NextResponse.redirect(new URL("/adriliciaus/unauthorized", req.url));
    }
  }
  // Si la ruta es "/checkout"
  if (req.nextUrl.pathname === "/adriliciaus/checkout") {
    const referrer = req.headers.get("referer");
    // Si no viene de la página del carrito, redirige a otra página
    if (!referrer || !referrer.includes("/adriliciaus/cart")) {
      return NextResponse.redirect(new URL("/adriliciaus/cart", req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/adriliciaus/admin/:path*",
    "/adriliciaus/cart/:path*",
    "/adriliciaus/checkout/:path*",
    "/adriliciaus/products/:path*",
    "/adriliciaus/profile/:path*",
    "/adriliciaus/wishlist/:path*",
    "/adriliciaus/unauthorized/:path*",
    "/adriliciaus/orders/:path*",
  ]
};
