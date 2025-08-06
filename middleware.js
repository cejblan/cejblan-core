import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import pluginRoles from "@/middleware.plugins.json" assert { type: "json" };

export default withAuth(async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  const role = token?.role?.toLowerCase(); // Normalizar a minúscula

  // ❌ Si no hay sesión o rol, redirige
  if (!role) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ Validaciones bajo /admin
  if (pathname.startsWith("/admin")) {
    const blockedByRole = {
      delivery: [
        "/admin/users",
        "/admin/products",
        "/admin/categories",
        "/admin/payments",
        "/admin/deliveries",
        "/admin/orders",
        "/admin/coins",
        "/admin/gallery",
        "/admin/cms",
        "/admin/settings",
        "/admin/developer",
      ],
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
      ],
    };

    const blockedPaths = blockedByRole[role] || [];

    for (const blocked of blockedPaths) {
      if (pathname === blocked || pathname.startsWith(`${blocked}/`)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // 🔐 Validar roles permitidos para cada plugin dinámico
    for (const [pluginPath, allowedRoles] of Object.entries(pluginRoles)) {
      if (
        pathname.startsWith(pluginPath) &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
      ) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  // 🛒 Validación de acceso directo a /checkout
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
    // Esto bloquea SOLO subrutas de /products, NO la raíz /products
    "/products/(.+)",
    "/profile/:path*",
    "/wishlist/:path*",
    "/unauthorized/:path*",
    "/orders/:path*",
  ],
};
