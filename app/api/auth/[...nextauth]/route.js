export const runtime = "nodejs";

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { conexion } from "@/libs/mysql";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    maxAge: 60 * 60, // 1 hora
  },
  callbacks: {
    async signIn({ user }) {
      try {
        const [existingUser] = await conexion.query(
          "SELECT * FROM users WHERE email = ?",
          [user.email]
        );

        if (existingUser.length === 0) {
          await conexion.query(
            "INSERT INTO users (name, email, rol, verified) VALUES (?, ?, ?, ?)",
            [user.name, user.email, "Cliente", "0"]
          );
        }
        return true;
      } catch (error) {
        console.error("Error al registrar el usuario:", error);
        return false;
      }
    },
    async jwt({ token }) {
      try {
        if (token?.email) {
          const [admin] = await conexion.query(
            "SELECT rol FROM users WHERE email = ?",
            [token.email]
          );
          token.admin = admin[0]?.rol === "Admin";

          // Configuraciones
          const [settings] = await conexion.query(
            "SELECT name, value FROM settings WHERE name IN (?, ?)",
            ["conversion_activa", "conversion_moneda"]
          );

          const activa = settings.find(s => s.name === "conversion_activa");
          const moneda = settings.find(s => s.name === "conversion_moneda");

          token.conversion_activa = activa?.value === "true";
          token.conversion_moneda = moneda?.value || "USD";

          // Tasa (moneda debe venir definida arriba)
          const [tasa] = await conexion.query(
            "SELECT valor FROM coins WHERE moneda = ? LIMIT 1",
            [token.conversion_moneda]
          );

          token.tasa_conversion = tasa[0]?.valor ?? null;

          // Obtener los IDs favoritos
          const [wishlistItems] = await conexion.query(
            "SELECT id FROM wishlist WHERE customer = ?",
            [token.email]
          );
          const productIds = wishlistItems.map(w => w.id);

          // Obtener detalles de los productos
          let wishlist = [];
          if (productIds.length > 0) {
            const [products] = await conexion.query(
              "SELECT * FROM products WHERE id IN (?)",
              [productIds]
            );
            wishlist = products;
          }

          token.wishlist = wishlist;

        }
      } catch (error) {
        console.error("Error en jwt callback:", error);
      }
      console.log(token)
      return token;
    },
    async session({ session, token }) {
      session.user.admin = !!token.admin;
      session.user.conversion_activa = token.conversion_activa;
      session.user.conversion_moneda = token.conversion_moneda;
      session.user.tasa_conversion = token.tasa_conversion;
      session.user.wishlist = token.wishlist;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };