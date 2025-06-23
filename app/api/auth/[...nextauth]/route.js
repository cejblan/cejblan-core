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
      const connection = await conexion.getConnection();
      try {
        const [existingUser] = await connection.query(
          "SELECT * FROM users WHERE email = ?",
          [user.email]
        );

        if (existingUser.length === 0) {
          await connection.query(
            "INSERT INTO users (name, email, rol, verified) VALUES (?, ?, ?, ?)",
            [user.name, user.email, "Cliente", "0"]
          );
        }
        return true;
      } catch (error) {
        console.error("Error al registrar el usuario:", error);
        return false;
      } finally {
        connection.release();
      }
    },
    async jwt({ token }) {
      const connection = await conexion.getConnection();
      try {
        if (token?.email) {
          const [admin] = await connection.query(
            "SELECT rol FROM users WHERE email = ?",
            [token.email]
          );

          if (admin[0].rol === "Admin") {
            token.admin = admin[0].rol === "Admin";
          } else {
            token.admin = false;
          }
        }
      } catch (error) {
        console.error("Error en la consulta de rol:", error);
      } finally {
        connection.release();
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