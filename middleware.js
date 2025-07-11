import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth(async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Rutas de admin: solo para roles permitidos
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req });
    const role = token?.role?.toLowerCase();
    const allowedRoles = ["Admin", "Desarrollador", "Vendedor"];

    if (!allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Validación de referrer para checkout
  if (req.nextUrl.pathname === "/checkout") {
    const referrer = req.headers.get("referer");
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
