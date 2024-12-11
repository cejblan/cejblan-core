import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { conexion } from "@/libs/mysql";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID.toString(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET.toString(),
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
          // Insertar el nuevo usuario en la base de datos
          await conexion.query(
            "INSERT INTO users (name, email, rol, verified) VALUES (?, ?, ?, ?)",
            [user.name, user.email, "Cliente", "0"]
          );
        }
      } catch (error) {
        console.error("Error al registrar el usuario:", error);
        return false; // Impide el inicio de sesión si hay un error crítico
      } finally {
        await conexion.end();
      }
      return true; // Permite el inicio de sesión
    },
    async jwt({ token }) {
      try {
        if (token) {
          const admin = await conexion.query("SELECT rol FROM users WHERE email = ?", token.email);
          if (admin[0].rol === "Admin") {
            token.admin = true;
          } else {
            token.admin = false;
          }
        }
        return token;
      } catch (error) {
        console.error("Error en la consulta de rol:", error);
        token.admin = false;
      } finally {
        await conexion.end();
      }
      return token;
    },
    async session({ session, token }) {
      if (token.admin === true) {
        session.user.admin = token.admin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };