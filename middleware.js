import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth(async function middleware(req) {
  const { pathname } = req.nextUrl;
  // Solo aplicamos la validación en las rutas de admin
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req });
    if (!token.admin) {
      // El usuario no es admin, redirige a una página de acceso denegado
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }
  // Si la ruta es "/checkout"
  if (req.nextUrl.pathname === "/checkout") {
    const referrer = req.headers.get("referer");
    // Si no viene de la página del carrito, redirige a otra página
    if (!referrer || !referrer.includes("/cart")) {
      return NextResponse.redirect(new URL("/cart", req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/products/:path*",
    "/profile/:path*",
    "/wishlist/:path*",
    "/unauthorized/:path*",
    "/orders/:path*",
  ]
};
