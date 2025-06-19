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

        if (!existingUser) {
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
          
          function detectarTipo(valor) {
            if (Array.isArray(valor)) return "array";
            if (valor === null) return "null";
            return typeof valor;
          }
          console.log(detectarTipo(admin));

          token.admin = admin[0].rol === "Admin";
        }
      } catch (error) {
        console.error("Error en la consulta de rol:", error);
        token.admin = false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.admin) {
        session.user.admin = true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };