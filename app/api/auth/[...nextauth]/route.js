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
          const [role] = await conexion.query(
            "SELECT rol FROM users WHERE email = ?",
            [token.email]
          );

          token.role = role[0]?.rol || null;

          // Configuraciones generales
          const [settings] = await conexion.query(
            "SELECT name, value FROM settings WHERE name IN (?, ?, ?, ?)",
            ["conversion_activa", "conversion_moneda", "logo_sitio", "paleta_colores"]
          );

          const activa = settings.find(s => s.name === "conversion_activa");
          const moneda = settings.find(s => s.name === "conversion_moneda");
          const logo = settings.find(s => s.name === "logo_sitio");
          const paleta = settings.find(s => s.name === "paleta_colores");

          token.conversion_activa = activa?.value === "true";
          token.conversion_moneda = moneda?.value || "USD";
          token.logo_sitio = logo?.value || null;
          token.paleta_colores = paleta?.value || null;

          // Tasa de conversión
          const [tasa] = await conexion.query(
            "SELECT valor FROM coins WHERE moneda = ? LIMIT 1",
            [token.conversion_moneda]
          );

          token.tasa_conversion = tasa[0]?.valor ?? null;

          // Wishlist
          const [wishlistItems] = await conexion.query(
            "SELECT id FROM wishlist WHERE customer = ?",
            [token.email]
          );
          const productIds = wishlistItems.map(w => w.id);

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
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.conversion_activa = token.conversion_activa;
      session.user.conversion_moneda = token.conversion_moneda;
      session.user.tasa_conversion = token.tasa_conversion;
      session.user.wishlist = token.wishlist;
      session.user.logo_sitio = token.logo_sitio;
      session.user.paleta_colores = token.paleta_colores;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };