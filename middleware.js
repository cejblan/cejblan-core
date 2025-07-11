import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth(async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });
  const role = token?.role?.toLowerCase();

  // Bloqueo general si no tiene sesión válida
  if (!role) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Bloqueo por rutas específicas
  if (pathname.startsWith("/admin")) {
    const blockedByRole = {
      vendedor: [
        "/admin/users",
        "/admin/products",
        "/admin/categories",
        "/admin/gallery",
        "/admin/cms",
        "/admin/settings",
        "/admin/developer",
      ],
      admin: [
        "/admin/developer"
      ]
    };

    const blockedPaths = blockedByRole[role] || [];

    for (const blocked of blockedPaths) {
      if (pathname === blocked || pathname.startsWith(`${blocked}/`)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  // Validación del checkout solo desde /cart
  if (pathname === "/checkout") {
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
